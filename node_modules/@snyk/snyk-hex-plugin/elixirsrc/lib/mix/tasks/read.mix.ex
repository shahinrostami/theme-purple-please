defmodule Mix.Tasks.Read.Mix do
  use Mix.Task

  @impl Mix.Task
  def run(args) do
    import Snyk.MixProject.Common
    import Snyk.MixProject.Mix.Project

    project_path = Enum.join(args, " ")

    data = load_mix_project(project_path)

    json_file_path = "snyk-mix-#{System.system_time(:millisecond)}.json";

    save_to_file(json_file_path, data)

    IO.puts(json_file_path)
  end
end
