import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getBreedsRequest, getPetTypesRequest } from "../api/ads.api";
import {
  deleteMyAdImageRequest,
  getMyAdRequest,
  updateMyAdRequest,
  uploadMyAdImagesRequest,
} from "../api/my-ads.api";
import AdForm from "../components/ads/AdForm";
import { useAuthStore } from "../store/auth.store";

function mapAdToForm(ad) {
  return {
    title: ad.title || "",
    petTypeId: ad.petTypeId || "",
    breedId: ad.breedId || "",
    adType: ad.adType || "SALE",
    animalGender: ad.animalGender || "UNKNOWN",
    ageMonths: ad.ageMonths || 0,
    price: ad.price || 0,
    city: ad.city || "",
    region: ad.region || "",
    description: ad.description || "",
    healthInfo: ad.healthInfo || "",
    vaccinationInfo: ad.vaccinationInfo || "",
    documentInfo: ad.documentInfo || "",
    housingInfo: ad.housingInfo || "",
    status: ["ACTIVE", "RESERVED", "SOLD"].includes(ad.status)
      ? ad.status
      : "ACTIVE",
  };
}

function EditAdPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const accessToken = useAuthStore((state) => state.accessToken);

  const [form, setForm] = useState(null);
  const [ad, setAd] = useState(null);
  const [files, setFiles] = useState([]);
  const [petTypes, setPetTypes] = useState([]);
  const [breeds, setBreeds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const selectedPetType = useMemo(() => {
    if (!form) return null;
    return petTypes.find((item) => item.id === form.petTypeId) || null;
  }, [petTypes, form]);

  async function reloadAd() {
    const data = await getMyAdRequest(id, accessToken);
    setAd(data.item);
    setForm(mapAdToForm(data.item));
  }

  useEffect(() => {
    let isMounted = true;

    async function loadInitialData() {
      try {
        const [petTypesData, adData] = await Promise.all([
          getPetTypesRequest(),
          getMyAdRequest(id, accessToken),
        ]);

        if (!isMounted) return;

        setPetTypes(petTypesData.items || []);
        setAd(adData.item);
        setForm(mapAdToForm(adData.item));
        setLoading(false);
      } catch (error) {
        if (!isMounted) return;

        setError(
          error?.response?.data?.message || "Не вдалося завантажити оголошення",
        );
        setLoading(false);
      }
    }

    loadInitialData();

    return () => {
      isMounted = false;
    };
  }, [id, accessToken]);

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

  async function handleDeleteImage(imageId) {
    setError("");
    setMessage("");

    try {
      await deleteMyAdImageRequest(id, imageId, accessToken);
      await reloadAd();
      setMessage("Фото видалено");
    } catch (error) {
      setError(error?.response?.data?.message || "Не вдалося видалити фото");
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setMessage("");
    setIsSubmitting(true);

    try {
      const updated = await updateMyAdRequest(id, form, accessToken);

      if (files.length) {
        await uploadMyAdImagesRequest(id, files, accessToken);
        setFiles([]);
        await reloadAd();
      } else {
        setAd(updated.item);
        setForm(mapAdToForm(updated.item));
      }

      setMessage(updated.message || "Оголошення оновлено");
    } catch (error) {
      setError(
        error?.response?.data?.message || "Не вдалося оновити оголошення",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="page">
        <div className="container">
          <div className="catalog-state">Завантаження оголошення...</div>
        </div>
      </div>
    );
  }

  if (error && !form) {
    return (
      <div className="page">
        <div className="container narrow-container">
          <div className="state-card">
            <div className="state-icon">🐾</div>
            <h1>Оголошення не знайдено</h1>
            <p>{error}</p>
            <button
              type="button"
              className="button"
              onClick={() => navigate("/profile")}
            >
              До профілю
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="container">
        <div className="page-toolbar">
          <div>
            <span className="hero-kicker">Редагування</span>
            <h1>Редагувати оголошення</h1>
            <p>
              Оновіть дані, статус або фото. Якщо текст виглядатиме підозріло,
              система позначить оголошення для уваги модератора.
            </p>
          </div>

          <div className="toolbar-actions">
            {ad?.slug ? (
              <Link to={`/ads/${ad.slug}`} className="button button-secondary">
                Переглянути на сайті
              </Link>
            ) : null}

            <Link to="/profile" className="button button-ghost">
              До профілю
            </Link>
          </div>
        </div>

        {ad?.moderationFlag && ad.moderationFlag !== "NONE" ? (
          <div className="moderation-alert">
            <strong>Статус модерації: {ad.moderationFlag}</strong>
            <span>
              {ad.moderationReason || "Оголошення потребує уваги модератора"}
            </span>
          </div>
        ) : null}

        {message ? (
          <div className="profile-note page-message">{message}</div>
        ) : null}
        {error ? <div className="form-error page-message">{error}</div> : null}

        <AdForm
          form={form}
          petTypes={petTypes}
          breeds={breeds}
          files={files}
          existingImages={ad?.images || []}
          isSubmitting={isSubmitting}
          submitLabel="Зберегти зміни"
          onChange={handleChange}
          onFilesChange={handleFilesChange}
          onSubmit={handleSubmit}
          onDeleteImage={handleDeleteImage}
        />
      </div>
    </div>
  );
}

export default EditAdPage;
