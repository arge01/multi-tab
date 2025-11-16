import { ChangeEvent, useState } from "react";
import { useData } from "@/components/multipage/Provider";
import { CollectMultiPage } from "@/decorators/MultiPage";

function A() {
  const [data, setData] = useData();

  const [value, setValue] = useState({
    name: "",
    surname: "",
    text: "",
  });

  const onChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setValue((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = () => {
    setData({ name: value.name, surname: value.surname });
  };

  return (
    <section className="p-6 max-w-2xl mx-auto">
      <h4 className="text-2xl font-bold text-gray-800 mb-6">A Page</h4>

      {/* Form */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-4">
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700 mb-1">
            Name
          </label>
          <input
            onChange={onChange}
            type="text"
            name="name"
            id="name"
            value={value.name}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter your name"
          />
        </div>

        <div>
          <label
            htmlFor="surname"
            className="block text-sm font-medium text-gray-700 mb-1">
            Surname
          </label>
          <input
            onChange={onChange}
            type="text"
            name="surname"
            id="surname"
            value={value.surname}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter your surname"
          />
        </div>

        <div>
          <label
            htmlFor="text"
            className="block text-sm font-medium text-gray-700 mb-1">
            Message
          </label>
          <textarea
            onChange={onChange}
            name="text"
            id="text"
            value={value.text}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter your message"
          />
        </div>

        <button
          onClick={handleSubmit}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200 font-medium">
          Submit
        </button>
      </div>

      {/* Data Display */}
      <div className="mt-6 bg-gray-50 rounded-lg p-4 border border-gray-200">
        <h5 className="text-lg font-semibold text-gray-700 mb-3">
          Current Data:
        </h5>
        <pre className="text-sm bg-white p-4 rounded border border-gray-200 overflow-auto">
          {JSON.stringify(data, null, 2)}
        </pre>
      </div>
    </section>
  );
}

CollectMultiPage({
  menuId: 1,
  name: "a-page",
  label: "A page",
  page: <A />,
})();

export default A;
