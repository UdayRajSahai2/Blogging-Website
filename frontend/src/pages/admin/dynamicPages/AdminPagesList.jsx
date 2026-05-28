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
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">Pages</h1>

        <div className="flex gap-2">
          {/* SEARCH */}
          <input
            type="text"
            placeholder="Search pages..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="
    w-72
    px-4
    py-2.5
    border
    border-gray-300
    rounded-lg
    text-sm
    outline-none
    focus:border-gray-500
  "
          />
        </div>
      </div>

      <div className="bg-white border rounded-xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-3">ID</th>
              <th className="text-left p-3">Title</th>

              <th className="text-left p-3">Path</th>

              <th className="text-left p-3">Status</th>

              <th className="text-left p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredPages.map((page) => (
              <tr key={page.id} className="border-t">
                <td className="p-3 text-gray-500">{page.id}</td>

                <td className="p-3">{page.title}</td>

                <td className="p-3">{page.path}</td>

                <td className="p-3 capitalize">{page.status}</td>

                <td className="p-3 flex gap-2">
                  <Link
                    to={`/admin/pages/${page.id}`}
                    className="text-blue-600"
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
  );
};

export default AdminPagesList;
