import type { Application } from "express";

export function printRoutes(app: Application) {
  const routes: { method: string; path: string }[] = [];

  function getMountPath(regexp: any): string {
  
    const match = regexp?.toString().match(/^\/\^\\\/(.+?)\\\/\?\(\?=\\\/\|\$\)\/i$/);
    return match ? "/" + match[1].replace(/\\\//g, "/") : "";
  }

  function scan(stack: any[], prefix: string = "") {
    stack.forEach((layer: any) => {
      if (layer.route) {
        const path = prefix + layer.route.path;
        const methods = Object.keys(layer.route.methods).map((m) => m.toUpperCase());
        methods.forEach((method) => routes.push({ method, path }));
      }

   
      if (layer.name === "router" && layer.handle?.stack) {
        const mountPath = getMountPath(layer.regexp);
        scan(layer.handle.stack, prefix + mountPath);
      }
    });
  }

  const root = (app as any)._router?.stack;
  if (!root) {
    console.log("No routes found.");
    return;
  }

  scan(root);

  console.table(routes);
// console.log(routes);
}
