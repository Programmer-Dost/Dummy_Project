import { useEffect, useState } from "react";
import { fetchExpenses } from "../../utils/api";
import { useUserContext } from "./../context/userContext";
import { API } from "./../../utils/api";
const ExpenseList = () => {
  const { userDetails, loading } = useUserContext();
  const [expenses, setExpenses] = useState([]);
  const [editIndex, setEditIndex] = useState(null); // which expense is being edited
  const [newDueDate, setNewDueDate] = useState("");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedStatuses, setSelectedStatuses] = useState([]);

  const categories = [
    "Cafe Food",
    "Groceries",
    "Munchies",
    "Outside Food",
    "Other",
  ];
  const statuses = ["Settled", "Pending"];
  const getExpenses = async () => {
    try {
      const fetchExpensesByEmail = () =>
        API.get(`/api/filterByEmail/?email=${userDetails.Email}`);
      const { data } = await fetchExpensesByEmail();
      setExpenses(data.expenses);
    } catch (err) {
      alert("Failed to fetch expenses");
    }
  };

  useEffect(() => {
    if (!loading && userDetails) {
      getExpenses();
    }
  }, []);

  //Filters
  const handleCategoryChange = (value) => {
    setSelectedCategories((prev) =>
      prev.includes(value)
        ? prev.filter((cat) => cat !== value)
        : [...prev, value]
    );
  };

  const handleStatusChange = (value) => {
    setSelectedStatuses((prev) =>
      prev.includes(value)
        ? prev.filter((status) => status !== value)
        : [...prev, value]
    );
  };

  const filteredData = expenses.filter((item) => {
    console.log("Expenses:", expenses);
    console.log("Selected Categories:", selectedCategories);
    console.log("Selected Statuses:", selectedStatuses);

    const categoryMatch =
      selectedCategories.length === 0 ||
      selectedCategories.includes(item.category);
    const statusMatch =
      selectedStatuses.length === 0 ||
      selectedStatuses.includes(item.sharedWith[0].status);
    return categoryMatch && statusMatch;
  });

  const updateDueDate = async (sharedEmail) => {
    console.log({ sharedEmail });
    console.log(userDetails.Email);
    try {
      const response = await fetch(
        "http://localhost:3001/api/update-due-date",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: userDetails.Email,
            sharedWith: sharedEmail,
            dueDate: newDueDate,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      const data = await response.json();
      console.log("Due date updated successfully:", data);
      alert("Due date updated successfully!");
      getExpenses();
    } catch (error) {
      console.error("Error updating due date:", error);
      alert("Failed to update due date. Please try again.");
    }
  };
  return (
    <div className="my-4">
      <div>
        <div className="flex flex-wrap gap-4 justify-center mb-6">
          {/* Categories */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Categories</h3>
            <div className="flex gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => handleCategoryChange(category)}
                  className={`px-4 py-2 rounded-lg font-medium ${
                    selectedCategories.includes(category)
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200 hover:bg-blue-100"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Status */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Status</h3>
            <div className="flex gap-2">
              {statuses.map((status) => (
                <button
                  key={status}
                  onClick={() => handleStatusChange(status)}
                  className={`px-4 py-2 rounded-lg font-medium ${
                    selectedStatuses.includes(status)
                      ? "bg-green-500 text-white"
                      : "bg-gray-200 hover:bg-green-100"
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
        </div>
        <h2 className="text-lg font-bold mt-8">Expenses</h2>
      </div>
      <ul>
        {filteredData.map((expense, index) => (
          <li
            key={expense._id}
            className="py-2 bg-gray-100 p-10 rounded-xl border-2 border-blue-200 md:w-1/2"
          >
            <span>
              {expense.title} - {expense.amount}rs. Category: {expense.category}
            </span>

            <ul>
              {expense.sharedWith.map((sharedWith) => {
                return (
                  <li key={sharedWith._id}>
                    <span>Shared With: {sharedWith.email}</span>
                    <span className="mx-2 font-medium">
                      Type: {sharedWith.type}
                    </span>
                    <span className="pr-2">Status: {sharedWith.status}</span>
                    <br />
                    <span>
                      Due Date:{" "}
                      {new Date(expense.dueDate).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "2-digit",
                      })}
                      <br />
                      {editIndex === index ? (
                        <div className="mt-2 flex flex-col items-start space-y-2">
                          <input
                            type="date"
                            value={newDueDate}
                            onChange={(e) => setNewDueDate(e.target.value)}
                            className="p-2 border rounded focus:ring focus:ring-blue-300"
                          />
                          <button
                            onClick={() => updateDueDate(sharedWith.email)}
                            className=" px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600"
                          >
                            Update
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setEditIndex(index)}
                          className=" mt-2 px-2 py-1 text-white bg-blue-500 rounded hover:bg-yellow-600"
                        >
                          Update Due Date
                        </button>
                      )}
                    </span>
                  </li>
                );
              })}
            </ul>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ExpenseList;
