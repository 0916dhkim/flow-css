import walk from "ignore-walk";
import path from "node:path";
import fs from "node:fs/promises";

export function FileService() {
  return {
    readFile: async (path: string) => {
      return await fs.readFile(path, "utf-8");
    },
    getAllFilesExceptIgnored: async (root: string) => {
      const files = (
        await walk({
          path: root,
          ignoreFiles: [".gitignore"],
        })
      )
        .filter((file) => !file.startsWith(".git/"))
        .map((file) => path.join(root, file));
      return files;
    },
  };
}

export type FileService = ReturnType<typeof FileService>;

export function FileServiceStub(
  fakeFiles: Record<string, string>
): FileService {
  return {
    readFile: async (path: string) => {
      const content = fakeFiles[path];
      if (content == null) {
        throw new Error(`File ${path} not found`);
      }
      return content;
    },
    getAllFilesExceptIgnored: async (root: string) => {
      return Object.keys(fakeFiles).filter((file) => file.startsWith(root));
    },
  };
}

function getExtension(file: string) {
  let filename = file.split("?", 2)[0]!;
  return path.extname(filename).slice(1);
}

export function isCssFile(file: string) {
  if (file.includes("/.vite/")) {
    return false;
  }
  let extension = getExtension(file);
  let isCssFile = extension === "css" || file.includes("&lang.css");
  return isCssFile;
}
