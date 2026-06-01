import { createRouteHandler } from "uploadthing/next";
import { ourFileRouter } from "./core";

// Export the GET and POST handlers created by UploadThing
export const { GET, POST } = createRouteHandler({
  router: ourFileRouter,
}); 