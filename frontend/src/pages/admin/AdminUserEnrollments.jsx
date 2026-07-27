import { useEffect, useState } from "react";

import { getEnrollments } from "../../api/admin/admin.api";

const AdminUserEnrollments = () => {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchEnrollments = async () => {
    try {
      setLoading(true);

      const data = await getEnrollments();

      setEnrollments(data?.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnrollments();
  }, []);

  if (loading) {
    return <div>Loading enrollments...</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4"> Enrollments</h1>

      <div className="overflow-x-auto border rounded-lg bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-3 py-2 text-left">ID</th>

              <th className="px-3 py-2 text-left">User</th>

              <th className="px-3 py-2 text-left">Referrer Name</th>

              <th className="px-3 py-2 text-left">Referrer Mobile</th>
              <th className="px-3 py-2 text-left">Referrer Email</th>

              <th className="px-3 py-2 text-left">Referrer District</th>
            </tr>
          </thead>

          <tbody>
            {enrollments.map((e) => (
              <tr key={e.enrollment_id} className="border-t hover:bg-gray-50">
                {/* ENROLLMENT ID */}
                <td className="px-3 py-2">#{e.enrollment_id}</td>

                {/* USER NAME */}
                <td className="px-3 py-2">{e.user?.fullname || "-"}</td>

                {/* REFERRER NAME */}
                <td className="px-3 py-2">{e.referrer_name || "-"}</td>

                {/* REFERRER MOBILE */}
                <td className="px-3 py-2">{e.referrer_mobile || "-"}</td>
                {/* REFERRER EMAIL */}
                <td className="px-3 py-2">{e.referrer_email || "-"}</td>

                {/* DISTRICT */}
                <td className="px-3 py-2">{e.referrer_district || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminUserEnrollments;
