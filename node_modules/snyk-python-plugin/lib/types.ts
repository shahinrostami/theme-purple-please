export interface DependencyUpdates {
  [from: string]: {
    upgradeTo: string;
  };
}

export interface ManifestFiles {
  // Typically these are requirements.txt and Pipfile;
  // the plugin supports paths with subdirectories
  [name: string]: string; // name-to-content
}

export type PackageManagers = 'pip' | 'setuptools' | 'pipenv' | 'poetry';

export const FILENAMES: {
  [key in PackageManagers]: { manifest: string; lockfile?: string };
} = {
  pip: {
    manifest: 'requirementes.txt',
  },
  setuptools: {
    manifest: 'setup.py',
  },
  pipenv: {
    manifest: 'Pipfile',
    lockfile: 'Pipfile.lock',
  },
  poetry: {
    manifest: 'pyproject.toml',
    lockfile: 'poetry.lock',
  },
};
