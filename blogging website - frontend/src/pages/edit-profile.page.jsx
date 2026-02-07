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

const EditProfile = () => {
  let bioLimit = 500;
  let {
    userAuth,
    userAuth: { access_token },setUserAuth
  } = useContext(UserContext);
  const [profile, setProfile] = useState(profileDataStructure);
  const [loading, setLoading] = useState(true);
  const [charactersLeft, setCharactersLeft] = useState(bioLimit);
  const [updatedProfileImg, setUpdatedProfileImg] = useState(null);
  const uploadButtonRef = useRef(null); // 🔧 added ref
  
  // Profession selection state
  const [selectedDomain, setSelectedDomain] = useState('');
  const [selectedField, setSelectedField] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('');

  let {
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
    personal_city,
    personal_country,
    personal_state,
    personal_street,
    personal_zip_code,
    profession_id,
    professional_city,
    professional_country,
    professional_state,
    professional_street,
    professional_zip_code,
  } = profile;

  useEffect(() => {
    if (access_token) {
      axios
        .post(import.meta.env.VITE_SERVER_DOMAIN + "/get-profile", {
          username: userAuth.username,
        })
        .then(({ data }) => {
          setProfile(data);
          setCharactersLeft(bioLimit - (data.bio ? data.bio.length : 0));
          
          // Set profession selections if profile_id exists
          if (data.profile_id) {
            // Parse profile_id to get profession details
            // This will be handled by the backend when we load the profile
            // For now, we'll set empty values and let the user select
            setSelectedDomain('');
            setSelectedField('');
            setSelectedSpecialty('');
          }
          
          setLoading(false);
        })
        .catch((err) => {
          console.log(err);
          setLoading(false);
        });
    }
  }, [access_token]);

  const handleCharacterChange = (e) => {
    setCharactersLeft(bioLimit - e.target.value.length);
  };

  const handleImagePreview = (e) => {
    let img = e.target.files[0];
    if (img) {
      setUpdatedProfileImg(img);
    }
  };

   const handleImageUpload = async (e) => {
    e.preventDefault();

    if (updatedProfileImg) {
      let loadingToast = toast.loading("Uploading...");
      if (uploadButtonRef.current) {
        uploadButtonRef.current.setAttribute("disabled", true);
      }

      try {
        // Get upload URL
        const { data: { uploadURL } } = await axios.get(
          import.meta.env.VITE_SERVER_DOMAIN + "/get-upload-url",
          { headers: { Authorization: `Bearer ${access_token}` } }
        );

        // Upload image to S3
        await axios.put(uploadURL, updatedProfileImg, {
          headers: { "Content-Type": updatedProfileImg.type },
        });

        // Extract image URL
        const url = new URL(uploadURL);
        const imageUrl = `${url.protocol}//${url.host}${url.pathname}`;

        // Update profile image in database
        await axios.post(
          import.meta.env.VITE_SERVER_DOMAIN + "/update-profile-img",
          { profile_img: imageUrl },
          { headers: { Authorization: `Bearer ${access_token}` } }
        );

        // Update local state
        setProfile({ ...profile, profile_img: imageUrl });
        setUpdatedProfileImg(null);

        // Update userAuth in context and session storage
        const updatedUser = {
          ...userAuth,
          profile_img: imageUrl
        };
        setUserAuth(updatedUser);
        storeInSession("user", updatedUser);

        toast.dismiss(loadingToast);
        toast.success("Profile image updated successfully");
      } catch (err) {
        toast.dismiss(loadingToast);
        toast.error("Failed to upload image");
        console.error(err);
      } finally {
        if (uploadButtonRef.current) {
          uploadButtonRef.current.removeAttribute("disabled");
        }
      }
    }
  };


  const handleSubmit = (e) => {
    e.preventDefault();
    let form = new FormData(e.target);
    let formData = {};

    for (let [key, value] of form.entries()) {
      formData[key] = value;
    }

    // Add profession data to form
    if (selectedDomain && selectedField && selectedSpecialty) {
      formData.domain_id = selectedDomain;
      formData.field_id = selectedField;
      formData.specialty_id = selectedSpecialty;
    }

    let loadingToast = toast.loading("Updating profile...");

    axios
      .post(import.meta.env.VITE_SERVER_DOMAIN + "/update-profile", formData, {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      })
      .then(({ data }) => {
        toast.dismiss(loadingToast);
        toast.success("Profile updated successfully");
      })
      .catch((err) => {
        toast.dismiss(loadingToast);
        toast.error("Failed to update profile");
      });
  };

  return (
    <AnimationWrapper>
      {loading ? (
        <Loader />
      ) : (
        <form onSubmit={handleSubmit}>
          <Toaster />
          <h1 className="max-md:hidden">Edit Profile Page</h1>
          <div className="flex flex-col lg:flex-row items-start py-10 gap-8 lg:gap-10">
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
                ref={uploadButtonRef} // 🔧 added ref here
              >
                Upload
              </button>
            </div>

            <div className="w-full">
              <div className="grid grid-cols-1 md:grid-cols-2 md:gap-5">
                <div>
                  <InputBox
                    name="fullname"
                    type="text"
                    value={fullname}
                    placeholder="Full Name"
                    disable={true}
                    icon="fi-rr-user"
                  />
                </div>
                <div>
                  <InputBox
                    name="email"
                    type="text"
                    value={email}
                    placeholder="Email"
                    disable={true}
                    icon="fi-sr-envelope"
                  />
                </div>
              </div>

              <InputBox
                type="text"
                name="username"
                value={username}
                placeholder="Username"
                icon="fi-rr-at"
              />
              <p className="text-dark-grey -mt-3">
                Username will be used to search user and will be visible to all
                users
              </p>

              <textarea
                name="bio"
                maxLength={bioLimit}
                defaultValue={bio}
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

              <p className="my-6 text-dark-grey">
                Add your social handles below
              </p>
              <div className="md:grid md:grid-cols-2 gap-x-6">
                <div>
                  <InputBox
                    name="youtube"
                    type="text"
                    value={youtube}
                    placeholder="YouTube"
                    icon="fi-brands-youtube"
                  />
                </div>
                <div>
                  <InputBox
                    name="instagram"
                    type="text"
                    value={instagram}
                    placeholder="Instagram"
                    icon="fi-brands-instagram"
                  />
                </div>
                <div>
                  <InputBox
                    name="facebook"
                    type="text"
                    value={facebook}
                    placeholder="Facebook"
                    icon="fi-brands-facebook"
                  />
                </div>
                <div>
                  <InputBox
                    name="twitter"
                    type="text"
                    value={twitter}
                    placeholder="Twitter"
                    icon="fi-brands-twitter"
                  />
                </div>
                <div>
                  <InputBox
                    name="github"
                    type="text"
                    value={github}
                    placeholder="GitHub"
                    icon="fi-brands-github"
                  />
                </div>
                <div>
                  <InputBox
                    name="website"
                    type="text"
                    value={website}
                    placeholder="Website"
                    icon="fi-rr-globe"
                  />
                </div>
              </div>

              <button className="btn-dark w-auto px-10 mt-8" type="submit">
                Update Profile
              </button>
            </div>
          </div>
        </form>
      )}
    </AnimationWrapper>
  );
};

export default EditProfile;
