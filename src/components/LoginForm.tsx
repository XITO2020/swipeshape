// src/components/LoginForm.tsx
import React, { useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import { useAppStore } from "../lib/store";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const { setAuthState, setUser } = useAppStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    
    try {
      // Authentification avec notre système JWT personnalisé
      const response = await axios.post("/api/auth", {
        email,
        password,
        action: "login"
      });
      
      // Store the JWT token in localStorage
      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
        
        // Update app state with user info
        setAuthState(true, response.data.user.role === "admin");
        setUser(response.data.user);
        
        // Redirect to dashboard or callback URL
        const callbackUrl = router.query.callbackUrl as string || "/dashboard";
        router.push(callbackUrl);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || "Erreur lors de la connexion. Veuillez réessayer.");
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <h1>Connexion</h1>
      <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
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
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Connexion..." : "Se connecter"}
        </Button>
      </form>
    </div>
  );
}