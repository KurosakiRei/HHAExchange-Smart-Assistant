import {
  newMessageReasonSelector,
  newMessageReasonOptionSelector,
  newMessageNoteSelector,
  newMessagePatientNameSelecotr,
} from "../utils/templates&const";

export const createNewQA = async () =>
  await messageHandler(
    "Quality Assurance",
    "Quality assurance call made to patient. Pt confirmed no hospitalizations, rehab admissions, or falls within the past 30 days. Address and contact information remain unchanged. Pt expressed satisfaction with current services, aide, and hours, and has no further questions at this time."
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
