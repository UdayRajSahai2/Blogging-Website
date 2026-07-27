import { useEffect, useState } from "react";

import { getAdminPages } from "../../../api/admin/admin.page.api";

import { Link } from "react-router-dom";

const AdminPagesList = () => {
  const [pages, setPages] = useState([]);
  const [search, setSearch] = useState("");

  const fetchPages = async () => {
    try {
      const res = await getAdminPages();

      setPages(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchPages();
  }, []);

  const filteredPages = pages.filter((page) =>
    page.title.toLowerCase().includes(search.toLowerCase()),
  );
  return (
    <div>
      {/* Header */}
      <div className="flex flex-col gap-3 mb-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl font-bold">Pages</h1>

        <input
          type="text"
          placeholder="Search pages..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full sm:w-72 px-4 py-2 border rounded-lg text-sm"
        />
      </div>

      {/* Responsive Table */}
      <div className="bg-white border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-[700px] w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-2 md:p-3 text-xs md:text-sm">ID</th>
                <th className="text-left p-2 md:p-3 text-xs md:text-sm">
                  Title
                </th>
                <th className="text-left p-2 md:p-3 text-xs md:text-sm">
                  Path
                </th>
                <th className="text-left p-2 md:p-3 text-xs md:text-sm">
                  Status
                </th>
                <th className="text-left p-2 md:p-3 text-xs md:text-sm">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredPages.map((page) => (
                <tr key={page.id} className="border-t hover:bg-gray-50">
                  <td className="p-2 md:p-3 text-xs md:text-sm text-gray-500">
                    {page.id}
                  </td>

                  <td className="p-2 md:p-3 text-xs md:text-sm whitespace-nowrap">
                    {page.title}
                  </td>

                  <td className="p-2 md:p-3 text-xs md:text-sm whitespace-nowrap">
                    {page.path}
                  </td>

                  <td className="p-2 md:p-3 text-xs md:text-sm capitalize">
                    {page.status}
                  </td>

                  <td className="p-2 md:p-3 text-xs md:text-sm">
                    <Link
                      to={`/admin/pages/${page.id}`}
                      className="text-blue-600 hover:underline"
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminPagesList;
