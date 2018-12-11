// We use Font Awesome for some icons

import { library } from "@fortawesome/fontawesome-svg-core";
import { faFile, faFolderOpen, faTimesCircle } from "@fortawesome/free-solid-svg-icons";

// We only add the icons we need because it makes the download much smaller.
library.add(faFile);
library.add(faFolderOpen);
library.add(faTimesCircle);

export { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
