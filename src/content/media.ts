/**
 * Every photograph used on the site lives here, with its alt text and credit.
 *
 * To replace a photo: drop a new file into src/assets/media and change the
 * import below. Width, height and the blur placeholder are read from the file
 * automatically, so layouts stay stable whatever you swap in.
 *
 * Current photos are from Unsplash and used under the Unsplash License
 * (https://unsplash.com/license). Credit is not required but is shown in the
 * footer as a courtesy. Replace them with your own photography before launch.
 */
import type { StaticImageData } from "next/image";

import serviceHome from "@/assets/media/service-home.jpg";
import serviceOffice from "@/assets/media/service-office.jpg";
import serviceMoveOut from "@/assets/media/service-move-out.jpg";
import serviceAfterBuilders from "@/assets/media/service-after-builders.jpg";
import standardPeople from "@/assets/media/standard-people.jpg";
import standardDetail from "@/assets/media/standard-detail.jpg";
import standardProducts from "@/assets/media/standard-products.jpg";
import bookingCalmRoom from "@/assets/media/booking-calm-room.jpg";
import showcaseDetail from "@/assets/media/showcase-detail.jpg";
import routeKitchen from "@/assets/media/route-kitchen.jpg";
import compareKitchen from "@/assets/media/compare-kitchen.jpg";
import compareBath from "@/assets/media/compare-bath.jpg";
import compareLiving from "@/assets/media/compare-living.jpg";

export interface Photo {
  src: StaticImageData;
  alt: string;
  /** CSS object-position, used to keep the subject in frame at every crop. */
  focus?: string;
  credit?: { name: string; url: string };
}

export const media = {
  routeKitchen: {
    src: routeKitchen,
    alt: "A real kitchen with a dark green island, marble worktops, pendant lights, a steel extractor hood and a garden door",
    focus: "50% 50%",
    credit: { name: "Clay Banks", url: "https://unsplash.com/photos/YFzqRFFyauw" },
  },
  compareKitchen: {
    src: compareKitchen,
    alt: "A bright farmhouse kitchen with white cabinets, a steel range, a sink under the window and fresh bread on the worktop",
    focus: "50% 50%",
    credit: { name: "Clay Banks", url: "https://unsplash.com/photos/nTqR3B3dp-Q" },
  },
  compareBath: {
    src: compareBath,
    alt: "A white bathroom with a marble shower, a timber vanity with brass taps, a round brass mirror and a large plant",
    focus: "50% 50%",
    credit: { name: "Clay Banks", url: "https://unsplash.com/photos/Fuguvv3goCA" },
  },
  compareLiving: {
    src: compareLiving,
    alt: "A calm living room with a pale corner sofa, a round coffee table, paper pendant lights and tall windows",
    focus: "50% 50%",
    credit: { name: "Pipcke", url: "https://unsplash.com/photos/g_5UyVBIX_k" },
  },
  serviceHome: {
    src: serviceHome,
    alt: "A cleaner mopping the pale floor of a bright, airy living room",
    focus: "38% 55%",
    credit: { name: "Vitaly Gariev", url: "https://unsplash.com/photos/2NcTLdFHpH8" },
  },
  serviceOffice: {
    src: serviceOffice,
    alt: "A sunlit open plan office with plants, a round green rug and two people working",
    focus: "50% 60%",
    credit: { name: "Copernico", url: "https://unsplash.com/photos/-8DAN9_oi8g" },
  },
  serviceMoveOut: {
    src: serviceMoveOut,
    alt: "A woman packing cardboard boxes in a living room on moving day",
    focus: "55% 50%",
    credit: { name: "Vitaly Gariev", url: "https://unsplash.com/photos/wS40ELZROLE" },
  },
  serviceAfterBuilders: {
    src: serviceAfterBuilders,
    alt: "A freshly finished white room with a wooden ladder, a stool and a plant",
    focus: "45% 60%",
    credit: { name: "Andrew Neel", url: "https://unsplash.com/photos/DLD5LvnFblU" },
  },
  standardPeople: {
    src: standardPeople,
    alt: "A cleaner in a green shirt and black gloves carefully vacuuming an upholstered ottoman",
    focus: "40% 45%",
    credit: { name: "Giorgio Trovato", url: "https://unsplash.com/photos/5TXz228u4eo" },
  },
  standardDetail: {
    src: standardDetail,
    alt: "A gloved hand dusting a marble kitchen island beside a woven stool",
    focus: "50% 40%",
    credit: { name: "Katie Pearse", url: "https://unsplash.com/photos/WnuDJlnuOhU" },
  },
  standardProducts: {
    src: standardProducts,
    alt: "Two amber glass spray bottles and a wooden brush on a timber surface",
    focus: "50% 55%",
    credit: { name: "Daiga Ellaby", url: "https://unsplash.com/photos/uooMllXe6gE" },
  },
  bookingCalmRoom: {
    src: bookingCalmRoom,
    alt: "A calm living room with sea glass walls, a linen sofa and soft daylight",
    focus: "50% 62%",
    credit: { name: "Minh Pham", url: "https://unsplash.com/photos/OtXADkUh3-I" },
  },
  showcaseDetail: {
    src: showcaseDetail,
    alt: "Hands polishing a black kitchen tap and sink with a cloth",
    focus: "55% 50%",
    credit: { name: "everdrop GmbH", url: "https://unsplash.com/photos/SqOMDOQb3ws" },
  },
} satisfies Record<string, Photo>;

export const photoCredits = Object.values(media)
  .map((photo) => photo.credit)
  .filter((credit, index, all) => all.findIndex((c) => c.name === credit.name) === index);
