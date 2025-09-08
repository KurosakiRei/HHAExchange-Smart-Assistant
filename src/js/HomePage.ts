import {
  homePageCommunicationTypeOptionSelector,
  homePageCommunicationTypeSelector,
  homePageCoordinatorOptionSelector,
  homePageCoordinatorSelector,
  homePageSearchButtonSelector,
  homePagestatusOptionSelector,
  homePagestatusSelector,
} from "../utils/templates&const";
import { sleep } from "../utils/util";

export const homePageSelector = async () => {
  await sleep(100);
  let communicationType = $(homePageCommunicationTypeSelector);

  for (const option of $(homePageCommunicationTypeOptionSelector)) {
    if ("Patient" == option.innerText) {
      communicationType.val(
        (option as HTMLOptionElement).getAttribute("value")
      );
      communicationType[0].dispatchEvent(new Event("change"));
      break;
    }
  }

  await sleep(500);

  let coordinator = $(homePageCoordinatorSelector);

  for (const option of $(homePageCoordinatorOptionSelector)) {
    if ("Tao Yang ext.503 TYang@alwaysNY.net" == option.innerText) {
      coordinator.val((option as HTMLOptionElement).getAttribute("value"));
      coordinator[0].dispatchEvent(new Event("change"));
      break;
    }
  }

  await sleep(300);
  let status = $(homePagestatusSelector);

  for (const option of $(homePagestatusOptionSelector)) {
    console.log(option);
    if ("Open" == option.innerText) {
      status.val((option as HTMLOptionElement).getAttribute("value"));
      status[0].dispatchEvent(new Event("change"));
      break;
    }
  }

  await sleep(100);
  $(homePageSearchButtonSelector)[0].click();
};
