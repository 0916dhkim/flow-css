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
  
  // Check for Vite query parameters that indicate the file is being processed as JavaScript
  const url = new URL(file, 'file://');
  const searchParams = url.searchParams;
  
  // These query parameters indicate Vite is processing the CSS as JavaScript
  if (searchParams.has('url') || 
      searchParams.has('raw') || 
      searchParams.has('worker') ||
      searchParams.has('sharedworker') ||
      searchParams.has('inline') ||
      searchParams.has('transform-only')) {
    return false;
  }
  
  let extension = getExtension(file);
  let isCssFile = extension === "css" || file.includes("&lang.css");
  return isCssFile;
}
