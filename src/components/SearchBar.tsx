type SearchBarProps = {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
};

const SearchBar: React.FC<SearchBarProps> = ({ value, onChange, onSubmit }) => {
  return (
    <form onSubmit={onSubmit}>
      <div className="mb-5">
        <label htmlFor="city" className="block mb-2 text-sm font-medium">
          Enter City
        </label>
        <input
          type="text"
          id="city"
          value={value}
          onChange={onChange}
          placeholder="e.g. Tokyo"
          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg w-full p-2.5"
          required
        />
      </div>
      <button
        type="submit"
        className="text-white bg-blue-700 hover:bg-blue-800 font-medium rounded-lg text-sm px-5 py-2.5"
      >
        Submit
      </button>
    </form>
  );
};

export default SearchBar;
