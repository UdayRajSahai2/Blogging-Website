import { useState, useEffect } from "react";
import apiClient from "../../../services/apiClient";
import { PROFESSIONS_API } from "../../../common/api";
import {
  addExperience,
  updateExperience,
  deleteExperience,
  getExperienceById,
} from "../../../api/professionalProfile.api";
import ExperienceList from "./ExperienceList";
import ExperienceForm from "./ExperienceForm";
import { PlusIcon, XMarkIcon } from "@heroicons/react/24/solid";
import { toast } from "react-hot-toast";

/* ---------------- EMPTY STATE ---------------- */

const emptyExperience = {
  designation: "",
  employer_name: "",
  industry: "",
  employer_type: "",
  employment_type: "",

  city: "",
  state: "",
  country: "",

  start_date: "",
  end_date: "",
  is_current: false,

  roles_responsibilities: "",
  achievements: "",

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
      // ================= VALIDATION FIRST =================

      if (!form.profession_id && !form.custom_profession) {
        return toast.error("Select or enter a Professional Domain");
      }

      if (!form.designation?.trim()) {
        return toast.error("Designation required");
      }

      if (!form.employer_name?.trim()) {
        return toast.error("Organization required");
      }

      if (!form.industry?.trim()) {
        return toast.error("Industry required");
      }

      if (!form.employment_type?.trim()) {
        return toast.error("Employment type required");
      }
      const missingLocation = [];
      if (!form.city) missingLocation.push("City");
      if (!form.state) missingLocation.push("State");
      if (!form.country) missingLocation.push("Country");

      if (missingLocation.length > 0) {
        return toast.error(`Location required: ${missingLocation.join(", ")}`);
      }
      const isCurrent = Boolean(form.is_current);

      if (!form.start_date) {
        return toast.error("Start date required");
      }

      if (!form.end_date && !isCurrent) {
        return toast.error("Please provide End Date or mark as Current");
      }
      if (!form.roles_responsibilities?.trim()) {
        return toast.error("Roles and responsibilities required");
      }

      if (!form.achievements?.trim()) {
        return toast.error("Achievements required");
      }

      // ================= ONLY NOW START LOADING =================
      setLoading(true);

      const payload = sanitize({
        ...form,
        end_date: form.is_current ? null : form.end_date,
      });

      let res;

      if (editingId) {
        res = await updateExperience(editingId, payload);

        setExperiences((prev) =>
          prev.map((e) => (e.id === editingId ? res.data.data : e)),
        );

        toast.success("Experience updated successfully");
      } else {
        res = await addExperience(payload);

        setExperiences((prev) => [res.data.data, ...prev]);

        toast.success("Experience added successfully");
      }

      resetForm();
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- EDIT ---------------- */
  const edit = async (exp) => {
    try {
      setShowForm(true);
      setEditingId(exp.id);

      const res = await getExperienceById(exp.id);
      const data = res.data.data;

      setForm({
        ...emptyExperience,

        ...data,

        city: data.city || "",
        state: data.state || "",
        country: data.country || "India",

        country_code: data.country_code || "",
        state_code: data.state_code || "",
        district_code: data.district_code || "",

        start_date: data.start_date || "",
        end_date: data.end_date || "",
        is_current: data.is_current || false,
      });

      if (data.profession_id) {
        const profession = await apiClient.get(
          `${PROFESSIONS_API}/profession/${data.profession_id}`,
        );

        const { domain_id, field_id, specialty_id } = profession.data.data;

        setSelectedDomain(domain_id);
        setSelectedField(field_id);
        setSelectedSpecialty(specialty_id);
      } else if (data.custom_profession) {
        setSelectedDomain("other");
        setSelectedSpecialty(`other:${data.custom_profession}`);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load experience");
    }
  };

  /* ---------------- DELETE ---------------- */
  const remove = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this experience?",
    );
    if (!confirmDelete) return;

    try {
      setLoading(true);

      await deleteExperience(id);

      setExperiences((prev) => prev.filter((e) => e.id !== id));

      toast.success("Experience deleted successfully");
    } catch (err) {
      console.error(err);
      toast.error("Delete failed");
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- UI ---------------- */

  return (
    <div className="w-full min-w-0">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-2">
        <div>
          <h1 className="text-sm sm:text-sm font-semibold text-gray-900">
            Experience
          </h1>

          <p className="text-xs sm:text-sm text-gray-500">
            Manage your professional experience
          </p>
        </div>

        <div className="flex items-center gap-2">
          {!showForm ? (
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-1.5 bg-blue-600 text-white px-3 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm hover:bg-blue-700 transition"
            >
              <PlusIcon className="w-4 h-4" />
              <span className="hidden sm:inline">Add Experience</span>
            </button>
          ) : (
            !editingId && (
              <button
                onClick={() => setShowForm(false)}
                className="
    inline-flex items-center gap-1.5
    px-3 py-1.5
    rounded-full
    bg-red-50
    text-red-600
    hover:bg-red-100 hover:text-red-700
    text-xs sm:text-sm
    font-medium
    transition
  "
              >
                <XMarkIcon className="w-4 h-4" />
                Cancel
              </button>
            )
          )}
        </div>
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
      {!showForm && (
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
      )}
    </div>
  );
}
