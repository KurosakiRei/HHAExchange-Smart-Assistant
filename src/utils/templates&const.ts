export const saveButtonSelector = "#uxBtnSaveVisit";
export const visitActionSelector = "#ddlEditAction";
export const visitActionOptionSelector = "#ddlEditAction > option";

export const visitReasonSelector = "#ddlReason";
export const visitReasonOptionSelector = "#ddlReason > option";

export const visitNotesSelector = "#txtNotes";
export const visitVerifyStarSelector = "#uxlblVerifiedBy";
export const visitAuditCaregiverSelector = "#uxChkCaregiver";
export const visitAuditPatientSelector = "#uxChkPatient";
export const visitScheduleTimeSelector = "#lblScheduledTime";
export const visitStartTimeInputSelector = "#txtVisitStartTime";
export const visitEndTimeInputSelector = "#txtVisitEndTime";

export const documentManagementSaveButtonSelector =
  "#AddEditDocumentModalSaveBtn";
export const attachmentFilenameSelector = "#lblFileName";
export const documentManagementDescrptionSelector =
  "#attachedDocumentDescription";

/* export const newMessageButtonSelector =
  "#nonServicePortalMessageFieldsContainer > tr.action-options > td > input:nth-child(2)"; */
export const newMessageButtonSelector =
  "#htmlmodal #BtnCancel, #htmlmodal #BtnSave, #BtnCancel, #BtnSave";
export const newMessageReasonSelector = "#ddlReasonList1";
export const newMessageReasonOptionSelector = "#ddlReasonList1 > option";
export const newMessageNoteSelector = "#txtNote";
export const newMessagePatientNameSelector = "#txtMember";
export const newMessagePatientNameSelecotr = newMessagePatientNameSelector;
export const newMessageIframeSelector = "#ctl00_ContentPlaceHolder1_iframemsg";

export const homePageSearchButtonSelector = "#btnSearch";
export const homePageCommunicationTypeSelector = "#ddlCommunicationType";
export const homePageCommunicationTypeOptionSelector =
  "#ddlCommunicationType > option";

export const homePageCoordinatorSelector = "#ddlCoordinator";
export const homePageCoordinatorOptionSelector = "#ddlCoordinator > option";

export const homePagestatusSelector = "#ddlstatus";
export const homePagestatusOptionSelector = "#ddlstatus > option";

export const prebillingSearchButtonSelector =
  "#ctl00_ContentPlaceHolder1_uxSearchPrebilling";
export const prebillingToDateSelector = "#ctl00_ContentPlaceHolder1_uxDtToDate";
export const prebillingAdvancedFilterButtonSelector = "#accordion-label";

export const prebillingDisciplineButtonSelector = "#discipid_choice";
export const prebillingDisciplineOptionSelectAllSelector =
  "#discipid_listbox > .ms-select-all > label > input";
export const prebillingDisciplineOptionSelector =
  "#discipid_listbox > li > label > span.text-wrap-div";

export const prebillingCoordinatorButtonSelector = "#coordid_choice";
export const prebillingCoordinatorOptionSelectAllSelector =
  "#coordid_fieldset ul > .ms-select-all > label > input";
export const prebillingCoordinatorOptionSelector =
  "#coordid_listbox > li > label > span.text-wrap-div";

export const prebillingSearchResultsSelector = "#tblDetails";
export const prebillingVisitAdmissionIdSelector =
  "#ucVisitHeader_lblAdmissionID";
export const prebillingVisitDateSelector = "#ucVisitHeader_lblVisitDate";
export const prebillingVisitScheduledTimeSelector = "#lblScheduledTime";

export const visitPatientNameSelector = "#ucVisitHeader_lblPatientName";
export const visitDateSelector = "#ucVisitHeader_lblVisitDate";
export const visitDutySelector = "#tdDutySheet tbody tr td:contains";
export const caregiverInfoNameSelector =
  "#ctl00_ContentPlaceHolder1_uxlblInfoName";

// --- incomingCallHandler ---
export const TOAST_CONTAINER_SELECTOR: string =
  ".Vue-Toastification__container.bottom-left";
export const TOAST_TOAST_SELECTOR: string = ".Vue-Toastification__toast";
export const TOAST_TOAST_WRAPPER_SELECTOR: string = ".call-toast-wrapper";
export const CALL_STATE_SELECTOR: string =
  ".CallStateAndIconWrapper__CallState";
export const MAIN_CONTENT_SELECTOR: string = ".main-content";
export const CALL_INFO_PANEL_SELECTOR: string = "div.call-info";
export const PHONE_NUMBER_CONTAINER_SELECTOR: string = ".contact-otherinfo";
