import "./App.css";
import useFetch from "./hooks/useFetch";

function App() {
  const endpoint = "https://api.thecatapi.com/v1/images/0XYvRd7oD";

  const { data, error, isLoading, isValidating, mutate } = useFetch(endpoint);

  console.log({
    data,
    error,
    isLoading,
    isValidating,
    mutate,
  });

  return (
    <>
      <div>SWR</div>
    </>
  );
}

export default App;
