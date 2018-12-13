function *myGenerator() {
  const value = -5.9
  |> abs
  |> (yield #);
}
