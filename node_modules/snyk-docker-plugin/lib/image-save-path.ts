import * as path from "path";
import * as tmp from "tmp";
import { v4 as uuidv4 } from "uuid";

export function fullImageSavePath(imageSavePath: string | undefined): string {
  let imagePath = tmp.dirSync().name;
  if (imageSavePath) {
    imagePath = path.normalize(imageSavePath);
  }

  return path.join(imagePath, uuidv4());
}
