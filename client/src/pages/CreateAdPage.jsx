import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getBreedsRequest, getPetTypesRequest } from "../api/ads.api";
import { createMyAdRequest, uploadMyAdImagesRequest } from "../api/my-ads.api";
import AdForm from "../components/ads/AdForm";
import { useAuthStore } from "../store/auth.store";

const initialForm = {
  title: "",
  petTypeId: "",
  breedId: "",
  adType: "SALE",
  animalGender: "UNKNOWN",
  ageMonths: 1,
  price: 0,
  city: "",
  region: "",
  description: "",
  healthInfo: "",
  vaccinationInfo: "",
  documentInfo: "",
  housingInfo: "",
  status: "ACTIVE",
};

function CreateAdPage() {
  const navigate = useNavigate();
  const accessToken = useAuthStore((state) => state.accessToken);

  const [form, setForm] = useState(initialForm);
  const [files, setFiles] = useState([]);
  const [petTypes, setPetTypes] = useState([]);
  const [breeds, setBreeds] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const selectedPetType = useMemo(() => {
    return petTypes.find((item) => item.id === form.petTypeId) || null;
  }, [petTypes, form.petTypeId]);

  useEffect(() => {
    let isMounted = true;

    async function loadPetTypes() {
      try {
        const data = await getPetTypesRequest();

        if (!isMounted) return;

        setPetTypes(data.items || []);
      } catch (error) {
        if (!isMounted) return;
        setPetTypes([]);
      }
    }

    loadPetTypes();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadBreeds() {
      if (!selectedPetType) {
        setBreeds([]);
        return;
      }

      try {
        const data = await getBreedsRequest({
          petTypeSlug: selectedPetType.slug,
        });

        if (!isMounted) return;

        setBreeds(data.items || []);
      } catch (error) {
        if (!isMounted) return;
        setBreeds([]);
      }
    }

    loadBreeds();

    return () => {
      isMounted = false;
    };
  }, [selectedPetType]);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((prev) => {
      if (name === "petTypeId") {
        return {
          ...prev,
          petTypeId: value,
          breedId: "",
        };
      }

      return {
        ...prev,
        [name]: value,
      };
    });
  }

  function handleFilesChange(nextFiles) {
    setFiles(Array.from(nextFiles || []));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const created = await createMyAdRequest(form, accessToken);
      let finalAd = created.item;

      if (files.length) {
        const uploaded = await uploadMyAdImagesRequest(
          finalAd.id,
          files,
          accessToken,
        );
        finalAd = uploaded.item || finalAd;
      }

      navigate(`/ads/${finalAd.slug}`);
    } catch (error) {
      setError(
        error?.response?.data?.message || "Не вдалося створити оголошення",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="page">
      <div className="container">
        <div className="page-toolbar">
          <div>
            <span className="hero-kicker">Особистий кабінет</span>
            <h1>Створити оголошення</h1>
            <p>
              Заповніть структуровану форму. Після збереження оголошення одразу
              з’явиться у каталозі, а система виконає базову перевірку контенту.
            </p>
          </div>

          <Link to="/profile" className="button button-secondary">
            До профілю
          </Link>
        </div>

        {error ? <div className="form-error page-message">{error}</div> : null}

        <AdForm
          form={form}
          petTypes={petTypes}
          breeds={breeds}
          files={files}
          isSubmitting={isSubmitting}
          submitLabel="Створити оголошення"
          onChange={handleChange}
          onFilesChange={handleFilesChange}
          onSubmit={handleSubmit}
          onDeleteImage={() => null}
        />
      </div>
    </div>
  );
}

export default CreateAdPage;
