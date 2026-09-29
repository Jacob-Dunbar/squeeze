import { library } from "@fortawesome/fontawesome-svg-core";
import {
  faAnglesRight,
  faArrowLeft,
  faCircleCheck,
  faHandPointer,
  faHourglassEnd,
  faLocationCrosshairs,
  faPen,
  faPlus,
  faSliders,
  faTrashCan,
  faUnlock,
} from "@fortawesome/free-solid-svg-icons";
import { WORKOUT_ICON_OPTIONS } from "./constants/workoutIcons";

library.add(
  ...WORKOUT_ICON_OPTIONS.map(({ icon }) => icon),
  faPen,
  faPlus,
  faHandPointer,
  faLocationCrosshairs,
  faHourglassEnd,
  faSliders,
  faAnglesRight,
  faArrowLeft,
  faCircleCheck,
  faUnlock,
  faTrashCan,
);
