// src/components/RegisterForm.tsx
import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import { isValidPassword } from "@/lib/validate";

export default function RegisterForm() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!isValidPassword(password)) {
      setError("Le mot de passe doit contenir 8 caractères, dont 1 majuscule et 1 chiffre.");
      return;
    }
    try {
      await axios.post("/api/auth", { email, name, password, action: "register" });
      navigate("/login");
    } catch (err: any) {
      setError(err.response?.data?.error || "Erreur lors de l’inscription");
    }
  };

  return (
    <div className="login-container">
      <h1>Inscription</h1>
      <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
        <Input
          type="text"
          label="Nom"
          value={name}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
          required
        />
        <Input
          type="email"
          label="Email"
          value={email}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
          required
        />
        <Input
          type="password"
          label="Mot de passe"
          value={password}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
          required
        />
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <Button type="submit">S’inscrire</Button>
      </form>
    </div>
  );
}
