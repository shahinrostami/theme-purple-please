import Snyk.MixProject.Common

defmodule Snyk.MixProject.Mix.Project do
  def load_mix_project(""), do: error("Please provide a valid path for the project")
  def load_mix_project(path) do
    manifest = load_manifest(path)

    apps = get_apps(manifest[:apps_path], path)

    lock_file_name = get_lock_file_name(manifest[:lockfile])
    lock_file_path = Path.join(path, lock_file_name)
    lock_file = read_file(lock_file_path)
    parent_umbrella_manifest = case Path.dirname(lock_file_path) do
      ^path -> nil
      parent_path -> load_manifest(parent_path, "parent_app")
    end

    %{
      manifest: manifest,
      lock: lock_file,
      apps: apps,
      parent_umbrella_manifest: parent_umbrella_manifest
    }
  end

  defp read_file(path) do
    Path.expand(path)
    |> Code.eval_file()
  end

  defp get_lock_file_name(nil), do: get_lock_file_name("")
  defp get_lock_file_name(""), do: "mix.lock"
  defp get_lock_file_name(filename), do: filename

  defp load_manifest(path), do: load_manifest(path, "root_app")
  defp load_manifest(path, app) do
    Mix.Project.in_project(
      String.to_atom(app),
      path,
      fn module ->
        module.project ++ [module_name: inspect(module)]
      end
    )
  end

  defp get_apps(nil, _), do: nil
  defp get_apps(apps_path, path) do
    Path.join([path, apps_path, "/*/mix.exs"])
    |> Path.absname
    |> Path.wildcard
    |> Enum.map(fn path -> Path.dirname(path) end)
    |> Enum.reduce(
         %{},
         fn full_project_path, acc ->
           relative_project_path = Path.relative_to(full_project_path, path)
           Map.put(acc, relative_project_path, load_manifest(full_project_path, relative_project_path))
         end
       )

  end
end
