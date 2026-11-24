import { zodResolver } from "@hookform/resolvers/zod";
import Cookies from "js-cookie";
import { Lock, LogOut, Mail, MapPin, Phone, Plus, User } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { z } from "zod";

import {
  useLogoutMutation,
  useMeQuery,
} from "../../redux/features/auth/authApiSlice";
import { useUpdateUserMutation } from "../../redux/features/users/usersApiSlice";

const addressSchema = z.object({
  country: z.string().min(1, "Country is required"),
  city: z.string().min(1, "City is required"),
  street: z.string().min(1, "Street is required"),
  building: z.string().min(1, "Building is required"),
  postalCode: z.string().min(1, "Postal code is required"),
});

const inputClass =
  "w-full rounded-lg border border-white/40 bg-white/50 px-5 py-4 text-slate-800 placeholder-slate-400 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100 dark:border-white/20 dark:bg-white/5 dark:text-slate-100 dark:placeholder-slate-500 dark:focus:ring-orange-500/20";

const cardClass =
  "rounded-2xl border border-white/30 bg-white/60 p-8 backdrop-blur-md dark:border-white/15 dark:bg-white/10";

const outlineBtn =
  "rounded-lg border border-orange-500 px-5 py-2.5 font-medium text-orange-600 transition hover:bg-orange-50 dark:border-orange-400 dark:text-orange-400 dark:hover:bg-orange-500/10";

function FieldError({ error }) {
  if (!error) return null;
  return <p className="mt-1 text-sm text-red-500">{error.message}</p>;
}

export default function Profile() {
  const navigate = useNavigate();

  const { data } = useMeQuery();

  const user = data?.user ?? data?.data ?? data ?? {};

  const [logout, { isLoading: loggingOut }] = useLogoutMutation();
  const [updateUser, { isLoading: saving }] = useUpdateUserMutation();

  const [addresses, setAddresses] = useState([]);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "" });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ resolver: zodResolver(addressSchema) });

  const name = user.username || "ADMIN";
  const email = user.email || "admin@koda.com";
  const phone = user.phone || "111";
  const role = user.role || "Admin";

  const startEdit = () => {
    setForm({ name, phone });
    setEditing(true);
  };

  const saveProfile = async (e) => {
    e.preventDefault();
    try {
      await updateUser({ id: user.id ?? user._id, ...form }).unwrap();
      toast.success("Profile updated");
      setEditing(false);
    } catch {
      toast.error("Could not update profile");
    }
  };

  const onAddAddress = (values) => {
    setAddresses((prev) => [...prev, { id: Date.now(), ...values }]);
    toast.success("Address added");
    reset();
  };

  const handleLogout = async () => {
    try {
      await logout().unwrap();
    } catch {}
    Cookies.remove("token", { path: "/" });
    Cookies.remove("user", { path: "/" });
    Cookies.remove("name", { path: "/" });
    Cookies.remove("role", { path: "/" });

    localStorage.removeItem("token");
    localStorage.removeItem("isAuthenticated");
    navigate("/login", { replace: true });
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="mb-8 text-4xl font-bold text-slate-900 dark:text-slate-100">
        My Profile
      </h1>

      {/* User info */}
      <div className={`${cardClass} mb-8`}>
        <div className="flex items-center gap-6">
          <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-slate-600">
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={name}
                className="h-full w-full object-cover"
              />
            ) : (
              <User size={56} className="text-slate-200" />
            )}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {name}
            </h2>
            <p className="text-slate-500 dark:text-slate-400">{email}</p>
            <span className="text-sm text-orange-600 dark:text-orange-400">
              {role}
            </span>
          </div>
        </div>

        {editing ? (
          <form onSubmit={saveProfile} className="mt-8 space-y-4">
            <input
              className={inputClass}
              placeholder="Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <input
              className={inputClass}
              placeholder="Phone"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-orange-500 px-5 py-2.5 font-semibold text-white transition hover:bg-orange-600 disabled:opacity-60"
              >
                {saving ? "Saving..." : "Save"}
              </button>
              <button
                type="button"
                onClick={() => setEditing(false)}
                className={outlineBtn}
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <>
            <div className="mt-8 space-y-4 text-slate-700 dark:text-slate-300">
              <div className="flex items-center gap-3">
                <Mail size={20} className="text-slate-400" />
                <span>{email}</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone size={20} className="text-slate-400" />
                <span>{phone}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={startEdit}
              className={`mt-8 ${outlineBtn}`}
            >
              Edit Profile
            </button>
          </>
        )}
      </div>

      {/* Addresses */}
      <div className={`${cardClass} mb-8`}>
        <h2 className="mb-4 flex items-center gap-3 text-xl font-bold text-slate-900 dark:text-slate-100">
          <MapPin size={22} className="text-orange-600 dark:text-orange-400" />
          Addresses
        </h2>

        {addresses.length === 0 ? (
          <p className="mb-6 text-slate-600 dark:text-slate-400">
            No addresses yet.
          </p>
        ) : (
          <ul className="mb-6 space-y-3">
            {addresses.map((a) => (
              <li
                key={a.id}
                className="rounded-lg border border-slate-200 p-4 text-slate-700 dark:border-slate-700 dark:text-slate-300"
              >
                {a.building}, {a.street}, {a.city}, {a.country} - {a.postalCode}
              </li>
            ))}
          </ul>
        )}

        <form onSubmit={handleSubmit(onAddAddress)} noValidate>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <input
                className={inputClass}
                placeholder="Country"
                {...register("country")}
              />
              <FieldError error={errors.country} />
            </div>
            <div>
              <input
                className={inputClass}
                placeholder="City"
                {...register("city")}
              />
              <FieldError error={errors.city} />
            </div>
            <div>
              <input
                className={inputClass}
                placeholder="Street"
                {...register("street")}
              />
              <FieldError error={errors.street} />
            </div>
            <div>
              <input
                className={inputClass}
                placeholder="Building"
                {...register("building")}
              />
              <FieldError error={errors.building} />
            </div>
            <div className="md:col-span-2">
              <input
                className={inputClass}
                placeholder="Postal code"
                {...register("postalCode")}
              />
              <FieldError error={errors.postalCode} />
            </div>
          </div>

          <button
            type="submit"
            className="mt-5 inline-flex items-center gap-2 rounded-lg bg-orange-500 px-5 py-2.5 font-semibold text-white transition hover:bg-orange-600"
          >
            <Plus size={18} />
            Add Address
          </button>
        </form>
      </div>

      {/* Change password */}
      <div className={`${cardClass} mb-8`}>
        <h2 className="mb-4 flex items-center gap-3 text-xl font-bold text-slate-900 dark:text-slate-100">
          <Lock size={22} className="text-orange-600 dark:text-orange-400" />
          Change Password
        </h2>
        <button
          type="button"
          onClick={() => navigate("/forgot-password")}
          className={outlineBtn}
        >
          Change Password
        </button>
      </div>

      {/* Logout */}
      <button
        type="button"
        onClick={handleLogout}
        disabled={loggingOut}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-red-600 py-3 font-semibold text-white transition hover:bg-red-700 disabled:opacity-60"
      >
        <LogOut size={18} />
        Logout
      </button>
    </div>
  );
}
