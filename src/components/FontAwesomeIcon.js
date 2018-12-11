// We use Font Awesome for some icons

import { library } from "@fortawesome/fontawesome-svg-core";
import { faFile, faFolderOpen, faTimesCircle } from "@fortawesome/free-solid-svg-icons";

library.add(faFile);
library.add(faFolderOpen);
library.add(faTimesCircle);

export { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
