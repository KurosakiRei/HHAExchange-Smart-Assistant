import GM_fetch from "@trim21/gm-fetch";
import { ApiParams, Coordinator } from "./types";

/**
 * 核心函数：通过三步网络请求获取所有可用的 Coordinator 列表
 * @returns 返回一个 Promise，其值为排序后的 Coordinator 数组
 */
export async function fetchAllCoordinators(): Promise<Coordinator[]> {
  // Step 1: 获取后续请求所需的认证参数
  console.log("Step 1: Fetching initial params...");
  const initialUrl =
    "https://app.hhaexchange.com/ENT2507010000/Call/CallMaintenance_ns.aspx";
  const r = (await GM_fetch(initialUrl, { method: "GET" })) as Response & {
    rawBody: Blob;
  };
  const textResult = await r.rawBody.text();

  const getParam = (name: string): string | undefined => {
    const match = textResult.match(
      new RegExp(`var\\s+${name}\\s*=\\s*['"]([^'"]+)['"];`)
    );
    return match ? match[1] : undefined;
  };

  const apiParams: ApiParams = {
    userID: getParam("gnUserID")!,
    appSecret: getParam("gnApSc")!,
    appVersion: getParam("gnAppVersion")!,
    version: getParam("gnVersion")!,
    minorVersion: getParam("gnMinorVersion")!,
    appName: getParam("gnApNm")!,
  };

  if (!apiParams.userID || !apiParams.appSecret) {
    throw new Error("Failed to extract initial API parameters from page.");
  }
  console.log("Step 1 Success. Params:", apiParams);

  // Step 2: 使用获取到的参数，请求所有的 Office ID
  console.log("Step 2: Fetching office IDs...");
  const officeUrl = `https://app.hhaexchange.com/HHAWS${
    apiParams.appVersion
  }${apiParams.version.replace(".", "")}010000/Office.asmx/GetAllOffices`;
  const officePayload = {
    ...apiParams,
    IPAddress: "127.0.0.1",
    PayrollSetupID: "-1",
    permissionName: "",
    selectedOfficeID: "-1",
    selectionType: "Filter",
  };

  const officeRes = await fetch(officeUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=UTF-8" },
    body: JSON.stringify(officePayload),
  });

  if (!officeRes.ok)
    throw new Error(`Failed to fetch office IDs: ${officeRes.statusText}`);

  const officeData = await officeRes.json();
  const offices = JSON.parse(officeData.d);
  const officeIDs: number[] = offices
    .map((o: any) => o.OfficeID)
    .filter((id: number) => id > 0);
  console.log("Step 2 Success. Office IDs:", officeIDs);

  // Step 3: 使用 Office ID 列表，请求所有的 Coordinator
  console.log("Step 3: Fetching coordinators...");
  const coordinatorUrl = `${initialUrl}/GetCoordinatorForOffice`;
  const officeXml = `<Offices>${officeIDs
    .map((id) => `<Office ID="${id}"/>`)
    .join("")}</Offices>`;

  const coordinatorRes = await fetch(coordinatorUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=UTF-8" },
    body: JSON.stringify({ officeXml }),
  });

  if (!coordinatorRes.ok)
    throw new Error(
      `Failed to fetch coordinators: ${coordinatorRes.statusText}`
    );

  const coordinatorData = await coordinatorRes.json();
  const coordinatorsRaw = JSON.parse(coordinatorData.d);

  // 清洗和格式化返回的数据
  const coordinators: Coordinator[] = coordinatorsRaw
    .map((c: any) => ({
      id: c.CoordinatorID,
      // 使用正则清理名字，只保留 "姓名 ext. 号码" 或不含邮箱的姓名
      name:
        c.CoordinatorName.match(/.*?ext\.\s*\d+|[^\s@]+(?:\s+[^\s@]+)*/)?.[0] ||
        c.CoordinatorName,
    }))
    .filter((c: Coordinator) => c.name.toLowerCase() !== "default"); // 过滤掉默认用户

  console.log("Step 3 Success. Found coordinators:", coordinators.length);

  // 按字母顺序排序后返回
  return coordinators.sort((a, b) => a.name.localeCompare(b.name));
}
