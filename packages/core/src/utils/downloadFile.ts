import axios from "axios";
import fs from "fs";

type DownloadFileOptions = {
  url: string;
  destination: string;
};

export const downloadFile = async ({
  url,
  destination,
}: DownloadFileOptions): Promise<void> => {
  const response = await axios({
    method: "get",
    url: url,
    responseType: "stream", // Ensure a readable stream is returned
  });

  const writer = fs.createWriteStream(destination);

  return new Promise<void>((resolve, reject) => {
    response.data.pipe(writer);
    writer.on("finish", resolve);
    writer.on("error", reject);
  });
};
