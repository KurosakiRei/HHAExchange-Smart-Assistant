import {
  newMessageReasonSelector,
  newMessageReasonOptionSelector,
  newMessageNoteSelector,
  newMessagePatientNameSelecotr,
} from "../utils/templates&const";

export const createNewQA = async () =>
  await messageHandler(
    "Quality Assurance",
    "Today, I made a random call with the patient. The patient is well and very satisfied with the services."
  );

export const createWelcomeCall = async () => {
  await messageHandler(
    "Welcome call",
    `I spoke to PT ${$(
      newMessagePatientNameSelecotr
    ).val()} and introduced myself and Always Home Care. PT. speaks Mandarin/Fuzhounese, no pets, no smoking/drinking, use cane and the address/schedule was confirmed.`
  );
};

async function messageHandler(reason: string, notes: string) {
  let expectedReason = reason;
  let select = $(newMessageReasonSelector);
  for (const reason of $(newMessageReasonOptionSelector)) {
    console.log(reason);
    if (expectedReason == reason.innerText) {
      select.val((reason as HTMLOptionElement).getAttribute("value"));
      select[0].dispatchEvent(new Event("change"));
      break;
    }
  }
  $(newMessageNoteSelector).val(notes);
  $(newMessageNoteSelector)[0].dispatchEvent(new Event("change"));
}
