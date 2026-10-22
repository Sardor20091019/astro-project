import { GET as handleGet } from "../../user-count/route";

export async function GET() {
  return handleGet();
}

