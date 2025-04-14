import {
  attachmentFilenameSelector,
  documentManagementDescrptionSelector,
} from "../utils/templates&const";
import { removeFileExtension } from "../utils/util";

export const copyAttachmentToDescrp = () => {
  $(documentManagementDescrptionSelector).val(
    removeFileExtension($(attachmentFilenameSelector).attr("title"))
  );
  $(documentManagementDescrptionSelector)[0].dispatchEvent(new Event("change"));
};
