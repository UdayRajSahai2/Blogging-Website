import { useContext, useEffect, useState, useRef } from "react";
import { UserContext } from "../App";
import axios from "axios";
import { profileDataStructure } from "./profile.page";
import AnimationWrapper from "../common/page-animation";
import Loader from "../components/loader.component";
import { Toaster, toast } from "react-hot-toast";
import InputBox from "../components/input.component";
import { storeInSession } from "../common/session";
import ProfessionSelector from "../components/profession-selector.component";
import { UPLOAD_API, USER_API } from "../common/api";

const EditProfile = () => {
  const bioLimit = 500;
  const {
    userAuth,
    userAuth: { access_token },
    setUserAuth,
  } = useContext(UserContext);

  const [profile, setProfile] = useState(profileDataStructure);
  const [loading, setLoading] = useState(true);
  const [charactersLeft, setCharactersLeft] = useState(bioLimit);
  const [updatedProfileImg, setUpdatedProfileImg] = useState(null);
  const uploadButtonRef = useRef(null);

  // Profession selection state
  const [selectedDomain, setSelectedDomain] = useState("");
  const [selectedField, setSelectedField] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("");

  const {
    fullname,
    username,
    profile_img,
    email,
    bio,
    facebook,
    instagram,
    twitter,
    youtube,
    github,
    website,
  } = profile;

  useEffect(() => {
    if (access_token) {
      axios
        .post(`${USER_API}/get-profile`, { username: userAuth.username })
        .then(({ data }) => {
          setProfile(data);
          setCharactersLeft(bioLimit - (data.bio ? data.bio.length : 0));

          // Initialize profession selections if available
          setSelectedDomain(data.domain_id || "");
          setSelectedField(data.field_id || "");
          setSelectedSpecialty(data.specialty_id || "");

          setLoading(false);
        })
        .catch((err) => {
          console.error(err);
          setLoading(false);
        });
    }
  }, [access_token, userAuth.username]);

  const handleCharacterChange = (e) => {
    setProfile({ ...profile, bio: e.target.value });
    setCharactersLeft(bioLimit - e.target.value.length);
  };

  const handleImagePreview = (e) => {
    const img = e.target.files[0];
    if (img) setUpdatedProfileImg(img);
  };

  const handleImageUpload = async (e) => {
    e.preventDefault();
    if (!updatedProfileImg) return;

    const loadingToast = toast.loading("Uploading...");
    if (uploadButtonRef.current)
      uploadButtonRef.current.setAttribute("disabled", true);

    try {
      const {
        data: { uploadURL },
      } = await axios.get(`${UPLOAD_API}/get-upload-url`, {
        headers: { Authorization: `Bearer ${access_token}` },
      });

      await axios.put(uploadURL, updatedProfileImg, {
        headers: { "Content-Type": updatedProfileImg.type },
      });

      const url = new URL(uploadURL);
      const imageUrl = `${url.protocol}//${url.host}${url.pathname}`;

      await axios.post(
        `${USER_API}/update-profile-img`,
        { profile_img: imageUrl },
        { headers: { Authorization: `Bearer ${access_token}` } },
      );

      setProfile({ ...profile, profile_img: imageUrl });
      setUpdatedProfileImg(null);

      const updatedUser = { ...userAuth, profile_img: imageUrl };
      setUserAuth(updatedUser);
      storeInSession("user", updatedUser);

      toast.dismiss(loadingToast);
      toast.success("Profile image updated successfully");
    } catch (err) {
      toast.dismiss(loadingToast);
      toast.error("Failed to upload image");
      console.error(err);
    } finally {
      if (uploadButtonRef.current)
        uploadButtonRef.current.removeAttribute("disabled");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const form = new FormData(e.target);
    const formData = {};

    for (let [key, value] of form.entries()) {
      formData[key] = value;
    }

    // Add profession data
    if (selectedDomain && selectedField && selectedSpecialty) {
      formData.domain_id = selectedDomain;
      formData.field_id = selectedField;
      formData.specialty_id = selectedSpecialty;
    }

    const loadingToast = toast.loading("Updating profile...");

    axios
      .post(`${USER_API}/update-profile`, formData, {
        headers: { Authorization: `Bearer ${access_token}` },
      })
      .then(() => {
        toast.dismiss(loadingToast);
        toast.success("Profile updated successfully");
      })
      .catch((err) => {
        toast.dismiss(loadingToast);
        toast.error("Failed to update profile");
        console.error(err);
      });
  };

  if (loading) return <Loader />;

  return (
    <AnimationWrapper>
      <form onSubmit={handleSubmit}>
        <Toaster />
        <h1 className="max-md:hidden">Edit Profile Page</h1>
        <div className="flex flex-col lg:flex-row items-start py-10 gap-8 lg:gap-10">
          {/* Profile Image Upload */}
          <div className="max-lg:center mb-5">
            <label
              htmlFor="uploadImg"
              id="profileImgLabel"
              className="relative block w-48 h-48 bg-grey rounded-full overflow-hidden"
            >
              <div className="h-full w-full absolute top-0 left-0 flex items-center justify-center text-white bg-black/80 opacity-0 hover:opacity-100 cursor-pointer">
                Upload Image
              </div>
              <img
                src={
                  updatedProfileImg
                    ? URL.createObjectURL(updatedProfileImg)
                    : profile_img
                }
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </label>
            <input
              type="file"
              id="uploadImg"
              accept=".jpeg, .png, .jpg"
              hidden
              onChange={handleImagePreview}
            />
            <button
              className="btn-light mt-5 max-lg:center lg:w-full px-10"
              onClick={handleImageUpload}
              type="button"
              ref={uploadButtonRef}
            >
              Upload
            </button>
          </div>

          {/* Profile Form */}
          <div className="w-full">
            <div className="grid grid-cols-1 md:grid-cols-2 md:gap-5">
              <InputBox
                name="fullname"
                type="text"
                value={fullname || ""}
                placeholder="Full Name"
                disable={true}
                icon="fi-rr-user"
              />
              <InputBox
                name="email"
                type="text"
                value={email || ""}
                placeholder="Email"
                disable={true}
                icon="fi-sr-envelope"
              />
            </div>

            <InputBox
              name="username"
              type="text"
              value={username || ""}
              placeholder="Username"
              icon="fi-rr-at"
              onChange={(e) =>
                setProfile({ ...profile, username: e.target.value })
              }
            />
            <p className="text-dark-grey -mt-3">
              Username will be used to search user and will be visible to all
              users
            </p>

            <textarea
              name="bio"
              maxLength={bioLimit}
              value={bio || ""}
              className="input-box h-64 lg:h-40 resize-none leading-7 mt-5 pl-5"
              placeholder="Bio"
              onChange={handleCharacterChange}
            />
            <p className="mt-1 text-dark-grey">
              {charactersLeft} characters left
            </p>

            <p className="my-6 text-dark-grey">
              Select your professional background
            </p>
            <ProfessionSelector
              selectedDomain={selectedDomain}
              selectedField={selectedField}
              selectedSpecialty={selectedSpecialty}
              onDomainChange={setSelectedDomain}
              onFieldChange={setSelectedField}
              onSpecialtyChange={setSelectedSpecialty}
            />

            <p className="my-6 text-dark-grey">Add your social handles below</p>
            <div className="md:grid md:grid-cols-2 gap-x-6">
              <InputBox
                name="youtube"
                type="text"
                value={youtube || ""}
                placeholder="YouTube"
                icon="fi-brands-youtube"
                onChange={(e) =>
                  setProfile({ ...profile, youtube: e.target.value })
                }
              />
              <InputBox
                name="instagram"
                type="text"
                value={instagram || ""}
                placeholder="Instagram"
                icon="fi-brands-instagram"
                onChange={(e) =>
                  setProfile({ ...profile, instagram: e.target.value })
                }
              />
              <InputBox
                name="facebook"
                type="text"
                value={facebook || ""}
                placeholder="Facebook"
                icon="fi-brands-facebook"
                onChange={(e) =>
                  setProfile({ ...profile, facebook: e.target.value })
                }
              />
              <InputBox
                name="twitter"
                type="text"
                value={twitter || ""}
                placeholder="Twitter"
                icon="fi-brands-twitter"
                onChange={(e) =>
                  setProfile({ ...profile, twitter: e.target.value })
                }
              />
              <InputBox
                name="github"
                type="text"
                value={github || ""}
                placeholder="GitHub"
                icon="fi-brands-github"
                onChange={(e) =>
                  setProfile({ ...profile, github: e.target.value })
                }
              />
              <InputBox
                name="website"
                type="text"
                value={website || ""}
                placeholder="Website"
                icon="fi-rr-globe"
                onChange={(e) =>
                  setProfile({ ...profile, website: e.target.value })
                }
              />
            </div>

            <button className="btn-dark w-auto px-10 mt-8" type="submit">
              Update Profile
            </button>
          </div>
        </div>
      </form>
    </AnimationWrapper>
  );
};

export default EditProfile;
