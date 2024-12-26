import { LoaderFunction } from "react-router-dom";

const userInfo = new Promise((resolve) => {
  setTimeout(() => {
    resolve({
      name: "Miguel",
      age: 24,
    });
  }, 9000);
});

const userRoles = new Promise((resolve) => {
  setTimeout(() => {
    resolve({
      role: "Admin",
    });
  }, 2000);
});

const layoutLoader: LoaderFunction = async () => {
  return {
    userInfo,
    userRoles,
  };
};

export const loaders = { layoutLoader };
export const actions = {};
