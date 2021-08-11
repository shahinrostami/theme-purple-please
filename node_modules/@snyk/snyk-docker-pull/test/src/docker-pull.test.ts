import * as path from "path";
import * as os from "os";
import * as fs from "fs";
import * as glob from "glob";
import * as fx from "mkdir-recursive";

import { DockerPull } from "../../src/docker-pull";
import { DockerPullOptions } from "../../src/types";
import { removeImage, listTar } from "../utils";

function rmdirRecursive(customPath: string[]): void {
  if (customPath.length < 2) {
    return;
  }

  fs.rmdirSync(path.join(...customPath));
  const next = customPath.slice(0, customPath.length - 1);
  rmdirRecursive(next);
}

jest.setTimeout(40000);

test("private image pull and load", async () => {
  const repo = process.env.SNYK_DRA_DOCKER_HUB_REPOSITORY;

  const opt: DockerPullOptions = {
    username: process.env.SNYK_DRA_DOCKER_HUB_USERNAME,
    password: process.env.SNYK_DRA_DOCKER_HUB_PASSWORD
  };

  // Add pull save request
  const pullSaveRequestPath = path.join(os.tmpdir(), "pullSaveRequest.json");
  fs.writeFileSync(
    pullSaveRequestPath,
    `{
  "foo" : {
    "username" : "${process.env.SNYK_DRA_DOCKER_HUB_USERNAME}",
    "repo" : "${process.env.SNYK_DRA_DOCKER_HUB_REPOSITORY}",
    "tag" : "alpine"
  }
}`
  );

  const dockerPull: DockerPull = new DockerPull();
  const imageDigest: string = (
    await dockerPull.pull("registry-1.docker.io", repo, "alpine", opt)
  ).imageDigest;
  expect(imageDigest).toBeDefined();
  const containerArchives = glob.sync(path.join(os.tmpdir(), "foo-*.tar"));
  expect(containerArchives.length).toBeGreaterThan(0);

  await removeImage(imageDigest);
  fs.unlinkSync(pullSaveRequestPath);
});

test("private image pull and build", async () => {
  const repo = process.env.SNYK_DRA_DOCKER_HUB_REPOSITORY;

  const opt: DockerPullOptions = {
    username: process.env.SNYK_DRA_DOCKER_HUB_USERNAME,
    password: process.env.SNYK_DRA_DOCKER_HUB_PASSWORD,
    loadImage: false
  };

  // Add pull save request
  const pullSaveRequestPath = path.join(os.tmpdir(), "pullSaveRequest.json");
  fs.writeFileSync(
    pullSaveRequestPath,
    `{
  "foo" : {
    "username" : "${process.env.SNYK_DRA_DOCKER_HUB_USERNAME}",
    "repo" : "${process.env.SNYK_DRA_DOCKER_HUB_REPOSITORY}",
    "tag" : "alpine"
  }
}`
  );

  const dockerPull: DockerPull = new DockerPull();
  const stagingDir = (
    await dockerPull.pull("registry-1.docker.io", repo, "alpine", opt)
  ).stagingDir;

  const containerArchives = glob.sync(path.join(os.tmpdir(), "foo-*.tar"));
  expect(containerArchives.length).toBeGreaterThan(0);

  const tarPath = path.join(stagingDir.name, "image.tar");
  expect(fs.existsSync(tarPath)).toBeTruthy();

  stagingDir.removeCallback();
  fs.unlinkSync(pullSaveRequestPath);
});

test("private multiarch manifest digest pull and build", async () => {
  const repo = `${process.env.SNYK_DRA_DOCKER_HUB_REPOSITORY}-multiarch`;
  const multiArchManifestDigestWithAmd64 =
    "sha256:5e2cb9c57eaef5ab6c99e7f7620ebf3c1c580928cf450e155e1b6306c6dd1939";

  const opt: DockerPullOptions = {
    username: process.env.SNYK_DRA_DOCKER_HUB_USERNAME,
    password: process.env.SNYK_DRA_DOCKER_HUB_PASSWORD,
    loadImage: false
  };

  // Add pull save request
  const pullSaveRequestPath = path.join(os.tmpdir(), "pullSaveRequest.json");
  fs.writeFileSync(
    pullSaveRequestPath,
    `{
  "foo" : {
    "username" : "${process.env.SNYK_DRA_DOCKER_HUB_USERNAME}",
    "repo" : "${repo}",
    "tag" : "${multiArchManifestDigestWithAmd64}"
  }
}`
  );

  const dockerPull: DockerPull = new DockerPull();
  const stagingDir = (
    await dockerPull.pull(
      "registry-1.docker.io",
      repo,
      multiArchManifestDigestWithAmd64,
      opt
    )
  ).stagingDir;

  const containerArchives = glob.sync(path.join(os.tmpdir(), "foo-*.tar"));
  expect(containerArchives.length).toBeGreaterThan(0);

  const tarPath = path.join(stagingDir.name, "image.tar");
  expect(fs.existsSync(tarPath)).toBeTruthy();

  stagingDir.removeCallback();
  fs.unlinkSync(pullSaveRequestPath);
});

test("pull from public repo", async () => {
  const registry = "registry-1.docker.io";
  const repo = "library/hello-world";
  const tag = "latest";
  const opt: DockerPullOptions = {
    loadImage: false,
    imageSavePath: "./custom/image/save/path"
  };
  // the custom path won't be create by the lib
  fx.mkdirSync(opt.imageSavePath);

  const dockerPull: DockerPull = new DockerPull();
  const resp = await dockerPull.pull(registry, repo, tag, opt);

  const tarPath = path.join(resp.stagingDir.name, "image.tar");
  expect(tarPath).toBe(path.join(resp.stagingDir.name, "image.tar"));
  expect(fs.existsSync(tarPath)).toBeTruthy();

  const tarListing = await listTar(tarPath);
  expect(tarListing.includes("manifest.json")).toBeTruthy();
  expect(tarListing.includes("./manifest.json")).toBeFalsy();
  tarListing.forEach(fileName => expect(fileName).not.toContain("./"));

  // it won't do nothing because we set imageSavePath
  resp.stagingDir.removeCallback();
  // clean up
  fs.unlinkSync(tarPath);
  rmdirRecursive(opt.imageSavePath.split(path.sep));
});

describe("calculate missing layers digest", () => {
  test("when set to true - should return calculated digests", async () => {
    const registry = "registry-1.docker.io";
    const repo = "library/hello-world";
    const tag = "latest";
    const opt: DockerPullOptions = {
      loadImage: false,
      calculateMissingLayersDigests: true
    };
    const dockerPull: DockerPull = new DockerPull();
    const resp = await dockerPull.pull(registry, repo, tag, opt);
    expect(resp.missingLayersCalculatedDigests).toEqual(
      resp.missingLayersDigests
    );

    resp.stagingDir.removeCallback();
  });

  test("when set to false - should not return calculated digests", async () => {
    const registry = "registry-1.docker.io";
    const repo = "library/hello-world";
    const tag = "latest";
    const opt: DockerPullOptions = {
      loadImage: false,
      calculateMissingLayersDigests: false
    };

    const dockerPull: DockerPull = new DockerPull();
    const resp = await dockerPull.pull(registry, repo, tag, opt);
    expect(resp.missingLayersCalculatedDigests).toEqual([]);

    resp.stagingDir.removeCallback();
  });
});
