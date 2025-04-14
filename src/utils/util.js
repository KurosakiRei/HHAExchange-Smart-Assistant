// import https from "https";

const tlsCiphers = [
  "TLS_CHACHA20_POLY1305_SHA256",
  "TLS_AES_128_GCM_SHA256",
  "TLS_AES_256_GCM_SHA384",
  "ECDHE-ECDSA-CHACHA20-POLY1305",
  "ECDHE-RSA-CHACHA20-POLY1305",
  "ECDHE-ECDSA-AES128-SHA256",
  "ECDHE-RSA-AES128-SHA256",
  "ECDHE-ECDSA-AES256-GCM-SHA384",
  "ECDHE-RSA-AES256-GCM-SHA384",
  "ECDHE-ECDSA-AES128-SHA",
  "ECDHE-RSA-AES128-SHA",
  "ECDHE-ECDSA-AES256-SHA",
  "ECDHE-RSA-AES256-SHA",
  "RSA-PSK-AES128-GCM-SHA256",
  "RSA-PSK-AES256-GCM-SHA384",
  "RSA-PSK-AES128-CBC-SHA",
  "RSA-PSK-AES256-CBC-SHA",
];

const tlsSigAlgs = [
  "ecdsa_secp256r1_sha256",
  "rsa_pss_rsae_sha256",
  "rsa_pkcs1_sha256",
  "ecdsa_secp384r1_sha384",
  "rsa_pss_rsae_sha384",
  "rsa_pkcs1_sha384",
  "rsa_pss_rsae_sha512",
  "rsa_pkcs1_sha512",
  "rsa_pkcs1_sha1",
];

// all my homies hate node-fetch
export const fetch = (url, options = {}) => {
  console.log(
    "Fetching url " + url.substring(0, 200) + (url.length > 200 ? "..." : "")
  );

  return new Promise((resolve, reject) => {
    const req = fetch(
      url,
      {
        agent: options.proxy,
        method: options.method || "GET",
        headers: {
          cookie: "dummy=cookie", // set dummy cookie, helps with cloudflare 1020
          "Accept-Language": "en-US,en;q=0.5", // same as above
          ...options.headers,
        },
        ciphers: tlsCiphers.join(":"),
        sigalgs: tlsSigAlgs.join(":"),
        minVersion: "TLSv1.3",
      },
      (resp) => {
        const res = {
          statusCode: resp.statusCode,
          headers: resp.headers,
        };
        let chunks = [];
        resp.on("data", (chunk) => chunks.push(chunk));
        resp.on("end", () => {
          res.body = Buffer.concat(chunks).toString(options.encoding || "utf8");
          resolve(res);
        });
        resp.on("error", (err) => {
          console.error(err);
          reject(err);
        });
      }
    );

    req.write(options.body || "");
    req.end();
    req.on("error", (err) => {
      console.error(err);
      reject(err);
    });
  });
};

export const parseSetCookie = (setCookie) => {
  if (!setCookie) {
    return {};
  }

  const cookies = {};
  for (const cookie of setCookie) {
    const sep = cookie.indexOf("=");
    cookies[cookie.slice(0, sep)] = cookie.slice(sep + 1, cookie.indexOf(";"));
  }
  return cookies;
};

export const stringifyCookies = (cookies) => {
  const cookieList = [];
  for (let [key, value] of Object.entries(cookies)) {
    cookieList.push(key + "=" + value);
  }
  return cookieList.join("; ");
};

// misc utils

export const wait = (ms) => new Promise((r) => setTimeout(r, ms));

export const promiseTimeout = async (promise, ms, valueIfTimeout = null) => {
  return await Promise.race([promise, wait(ms).then(() => valueIfTimeout)]);
};

export const findKeyOfValue = (obj, value) =>
  Object.keys(obj).find((key) => obj[key] === value);

export const calcLength = (any) => {
  if (!isNaN(any)) any = any.toString();
  return any.length;
};

export const removeFileExtension = (filename) => {
  const lastDotIndex = filename.lastIndexOf(".");
  if (lastDotIndex === -1) return filename; // 没有.则返回原字符串
  return filename.substring(0, lastDotIndex);
};

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export const assignIntervalTimer = (
  originBtnSelector,
  JQel,
  elId,
  bindFunc,
  param,
  direction = "left"
) => {
  // let intervalbtnGroup: string | number | NodeJS.Timer;
  let $btnGroup;

  setInterval(() => {
    $btnGroup = $(originBtnSelector).parent();
    if ($btnGroup && $(elId).length <= 0) {
      if (direction == "left") {
        $btnGroup.prepend(JQel);
      } else if (direction == "right") {
        $btnGroup.append(JQel);
      } else {
        $btnGroup.prepend(JQel);
      }
      if (param?.length > 0) {
        JQel.on("click", () => bindFunc(...param));
      } else {
        JQel.on("click", () => bindFunc());
      }

      // clearInterval(intervalbtnGroup)
    }

    //#ctl00_ContentPlaceHolder1_uxGvSearch   FOR CALLMAINTANANCE TABLE ID

    // console.log("cookies:", getAllCookies());
  }, 1000);
};

export const getYesterdayFormatted = () => {
  const today = new Date();
  today.setDate(today.getDate() - 1); // 获取前一天

  const mm = String(today.getMonth() + 1).padStart(2, "0"); // 月份是从0开始的
  const dd = String(today.getDate()).padStart(2, "0");
  const yyyy = today.getFullYear();

  return `${mm}/${dd}/${yyyy}`;
};

export const getTodayMMDD = () => {
  const today = new Date();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  return `${mm}/${dd}`;
};

export const convertMilitaryTime = (timeStr) => {
  if (!/^\d{4}$/.test(timeStr)) {
    throw new Error("Please enter a 4-digits string, Ex. '0930', '1600'");
  }

  const hours24 = parseInt(timeStr.slice(0, 2), 10);
  const minutes = parseInt(timeStr.slice(2), 10);

  const period = hours24 >= 12 ? "PM" : "AM";
  const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12;

  return minutes === 0
    ? `${hours12}${period}`
    : `${hours12}:${minutes.toString().padStart(2, "0")}${period}`;
};
