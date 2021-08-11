defmodule Snyk.MixProject.Common do
  def save_to_file(file_path, content) do
    file = case File.open(file_path, [:write]) do
      {:ok, file} -> file
      {:error, error_msg} -> error(error_msg)
    end

    IO.binwrite(file, JSON.encode!(content))
  end

  def error(msg) do
    Mix.shell().error(msg)
    System.halt(1)
  end
end

defimpl JSON.Encoder, for: Regex do
  def encode(_), do: {:ok, "\"regex\""}

  def typeof(_), do: :string
end
