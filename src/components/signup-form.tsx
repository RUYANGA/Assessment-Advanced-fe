"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import api from "@/lib/api"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { toast } from "react-hot-toast"
import type { AxiosError } from "axios"
import { Loader2 } from "lucide-react"

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [form, setForm] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    first_name: "",
    last_name: "",
    phone_number: "",
  })
  const [loading, setLoading] = useState(false)
  const router= useRouter()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      const payload = {
        email: form.email,
        password: form.password,
        first_name: form.first_name,
        last_name: form.last_name,
        phone_number: form.phone_number,
      };
      const res = await api.post("/auth/register/", payload);
      toast.success(res.data?.detail || "Registration successful. Check your email for verification link.");
      setForm({
        email: "",
        password: "",
        confirmPassword: "",
        first_name: "",
        last_name: "",
        phone_number: "",
      });
      router.push('/login')
    } catch (err) {
      type RegisterError = {
        email?: string[];
        password?: string[];
        non_field_errors?: string[];
        detail?: string;
        [key: string]: unknown;
      };
      const error = err as AxiosError<RegisterError>;
      const data = error.response?.data;
      const fieldMsg =
        (Array.isArray(data?.email) && data?.email[0]) ||
        (Array.isArray(data?.password) && data?.password[0]) ||
        (Array.isArray(data?.non_field_errors) && data?.non_field_errors[0]) ||
        (typeof data?.detail === "string" && data.detail);
      const msg = fieldMsg || error.message || "Registration failed";
      toast.error(msg);
      // Optionally: setFormErrors(data || { network: [error.message] });
    }
    setLoading(false);
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Create your account</CardTitle>
          <CardDescription>
            Enter your details below to create your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <FieldGroup>
              <Field className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field>
                  <FieldLabel htmlFor="first_name">First Name</FieldLabel>
                  <Input
                    id="first_name"
                    name="first_name"
                    type="text"
                    placeholder="John"
                    required
                    value={form.first_name}
                    onChange={handleChange}
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="last_name">Last Name</FieldLabel>
                  <Input
                    id="last_name"
                    name="last_name"
                    type="text"
                    placeholder="Doe"
                    required
                    value={form.last_name}
                    onChange={handleChange}
                  />
                </Field>
              </Field>
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  value={form.email}
                  onChange={handleChange}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="phone_number">Phone Number</FieldLabel>
                <Input
                  id="phone_number"
                  name="phone_number"
                  type="tel"
                  placeholder="07xx xxx xxx"
                  required
                  value={form.phone_number}
                  onChange={handleChange}
                />
              </Field>
              <Field className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field>
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    required
                    value={form.password}
                    onChange={handleChange}
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="confirmPassword">
                    Confirm Password
                  </FieldLabel>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    required
                    value={form.confirmPassword}
                    onChange={handleChange}
                  />
                </Field>
              </Field>
              <FieldDescription>
                Must be at least 8 characters long.
              </FieldDescription>
              <Field>
                <Button className="bg-indigo-400 hover:bg-indigo-600" type="submit" disabled={loading}>
                  {loading ? (
                    <span className="inline-flex items-center gap-2">
                      <Loader2 className="animate-spin w-5 h-5" />
                      Creating...
                    </span>
                  ) : (
                    "Create Account"
                  )}
                </Button>
                <FieldDescription className="text-center">
                  Already have an account? <a href="/login">Sign in</a>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
      
    </div>
  )
}
