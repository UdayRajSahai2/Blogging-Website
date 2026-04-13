import { useState } from "react";
import apiClient from "../../../services/apiClient";
import { PROFESSIONS_API } from "../../../common/api";
import ExperienceList from "./ExperienceList";
import ExperienceForm from "./ExperienceForm";

/* ---------------- EMPTY STATE ---------------- */

const emptyExperience = {
  designation: "",
  employer_name: "",
  industry: "",
  employer_type: "",
  employment_type: "",
  experience_type: "employment",
  location_type: "",

  city: "",
  state: "",
  country: "",

  start_date: "",
  end_date: "",
  is_current: false,

  roles_responsibilities: "",
  achievements: "",

  experience_document_url: "",

  profession_id: null, // keep null (not input field)
  custom_profession: "",
};

/* ---------------- COMPONENT ---------------- */

export default function ExperienceSection({
  experiences,
  setExperiences,
  api,
  sanitize,
}) {
  const [form, setForm] = useState(emptyExperience);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);

  const [showForm, setShowForm] = useState(false);

  const [selectedDomain, setSelectedDomain] = useState("");
  const [selectedField, setSelectedField] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("");

  /* ---------------- RESET ---------------- */
  const resetForm = () => {
    setEditingId(null);
    setForm(emptyExperience);
    setSelectedDomain("");
    setSelectedField("");
    setSelectedSpecialty("");
    setShowForm(false);
  };

  /* ---------------- SAVE ---------------- */
  const save = async () => {
    try {
      setLoading(true);

      if (!form.designation) return alert("Designation required");
      if (!form.employer_name) return alert("Employer required");
      if (!form.employment_type) return alert("Employment type required");
      if (!form.start_date) return alert("Start date required");

      if (!form.profession_id && !form.custom_profession) {
        return alert("Select or enter a profession");
      }

      const payload = sanitize({
        ...form,
        end_date: form.is_current ? null : form.end_date,
      });

      let res;

      if (editingId) {
        res = await apiClient.put(`${api}/experience/${editingId}`, payload);

        setExperiences((prev) =>
          prev.map((e) => (e.id === editingId ? res.data.data : e)),
        );
      } else {
        res = await apiClient.post(`${api}/experience`, payload);
        setExperiences((prev) => [res.data.data, ...prev]); // latest on top
      }

      resetForm();
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- EDIT ---------------- */
  const edit = async (exp) => {
    setEditingId(exp.id);
    setShowForm(true);

    setForm({
      ...emptyExperience,
      ...exp,
      start_date: exp.start_date || "",
      end_date: exp.end_date || "",
      is_current: exp.is_current || false,
    });

    if (exp.profession_id) {
      try {
        const res = await apiClient.get(
          `${PROFESSIONS_API}/profession/${exp.profession_id}`,
        );

        const { domain_id, field_id, specialty_id } = res.data.data;

        setSelectedDomain(domain_id);
        setSelectedField(field_id);
        setSelectedSpecialty(specialty_id);
      } catch (err) {
        console.error(err);
      }
    } else if (exp.custom_profession) {
      setSelectedDomain("other");
      setSelectedSpecialty(`other:${exp.custom_profession}`);
    }
  };

  /* ---------------- DELETE ---------------- */
  const remove = async (id) => {
    try {
      await apiClient.delete(`${api}/experience/${id}`);
      setExperiences((prev) => prev.filter((e) => e.id !== id));
    } catch (err) {
      alert("Delete failed");
    }
  };

  /* ---------------- UI ---------------- */

  return (
    <div className="w-full min-w-0">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <h4 className="text-base font-semibold text-gray-800">Experience</h4>

        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="text-sm bg-blue-600 text-white px-1 py-1 mb-2 rounded-full hover:bg-blue-700"
          >
            + Add Experience
          </button>
        )}
      </div>

      {/* FORM (ONLY WHEN NEEDED) */}
      {showForm && (
        <div className="animate-fadeIn">
          <ExperienceForm
            form={form}
            setForm={setForm}
            loading={loading}
            editingId={editingId}
            selectedDomain={selectedDomain}
            selectedField={selectedField}
            selectedSpecialty={selectedSpecialty}
            setSelectedDomain={setSelectedDomain}
            setSelectedField={setSelectedField}
            setSelectedSpecialty={setSelectedSpecialty}
            onSave={save}
            onCancel={resetForm}
          />
        </div>
      )}

      {/* LIST */}
      <div className="space-y-3">
        {experiences.length === 0 ? (
          <div></div>
        ) : (
          <ExperienceList
            experiences={experiences}
            onEdit={edit}
            onDelete={remove}
          />
        )}
      </div>
    </div>
  );
}
