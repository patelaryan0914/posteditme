"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { toast } from "sonner";
import { Loader2, Mail, Lock, User, Phone, Languages } from "lucide-react";
import { INDIAN_LANGUAGES, DEFAULT_ADMIN_EMAIL } from "@/lib/constant/constant";
import { Badge } from "@/components/ui/badge";
import { signupSchema } from "@/lib/zod-schema";
import { trpc } from "@/app/_trpc/client";
import { useRouter } from "next/navigation";
import { setCookie } from "@/lib/utils";

export function SignUpForm() {
  const [isLoading, setIsLoading] = React.useState(false);
  const router = useRouter();
  const form = useForm<z.infer<typeof signupSchema>>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
      languages: [],
    },
  });

  const selectedLanguages = form.watch("languages") || [];

  const toggleLanguage = (language: string) => {
    const current = form.getValues("languages") || [];
    const updated = current.includes(language)
      ? current.filter((l) => l !== language)
      : [...current, language];
    form.setValue("languages", updated, { shouldValidate: true });
  };

  const createUserMutation = trpc.auth.createUser.useMutation({
    onSuccess: (data) => {
      if (data.user.role === "system_admin") {
        toast.success("Account created successfully!");
      }
      setCookie("postEditAccessToken", data.token, 7);
      router.push("/");
      form.reset();
      toast.success(
        "Account created successfully! Please wait for admin approval."
      );
      setCookie("postEditAccessToken", data.token, 7);
      router.push("/");
      form.reset();
    },
    onError: (error) => {
      const zodError = (error.data as any)?.zodError as {
        fieldErrors?: Record<string, string[]>;
      } | null;

      if (zodError?.fieldErrors) {
        Object.entries(zodError.fieldErrors).forEach(([field, messages]) => {
          form.setError(field as any, {
            type: "server",
            message: messages?.[0] || "Validation error",
          });
        });
        toast.error("Please fix the form errors");
      } else {
        toast.error(error.message || "An unexpected error occurred");
      }
    },
  });
  async function onSubmit(values: z.infer<typeof signupSchema>) {
    setIsLoading(true);
    try {
      const isDefaultAdmin =
        values.email.toLowerCase() === DEFAULT_ADMIN_EMAIL.toLowerCase();
      await createUserMutation.mutateAsync({
        ...values,
        approved: isDefaultAdmin,
        role: isDefaultAdmin ? "system_admin" : "user",
        status: "active",
      });
    } catch {
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Welcome back</h2>
        <p className="text-muted-foreground mt-2">
          Sign in to your account to continue
        </p>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {form.formState.errors.root && (
            <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">
              {form.formState.errors.root.message}
            </div>
          )}

          {/* Personal Information */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="John" className="pl-9" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Doe" className="pl-9" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="john@example.com"
                          type="email"
                          className="pl-9"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="+91 9876543210"
                          className="pl-9"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Language Selection */}
          <FormField
            control={form.control}
            name="languages"
            render={({}) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  <Languages className="h-4 w-4" />
                  Languages
                </FormLabel>
                <FormDescription>
                  Select the languages you can work with
                </FormDescription>
                <div className="flex flex-wrap gap-2 mt-2">
                  <Badge
                    key="English"
                    variant={
                      selectedLanguages.includes("English")
                        ? "default"
                        : "outline"
                    }
                    className="cursor-pointer hover:bg-primary/90 transition-colors"
                    onClick={() => toggleLanguage("English")}
                  >
                    English
                  </Badge>
                  {INDIAN_LANGUAGES.map((language) => (
                    <Badge
                      key={language}
                      variant={
                        selectedLanguages.includes(language)
                          ? "default"
                          : "outline"
                      }
                      className="cursor-pointer hover:bg-primary/90 transition-colors"
                      onClick={() => toggleLanguage(language)}
                    >
                      {language}
                    </Badge>
                  ))}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Password */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input type="password" className="pl-9" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input type="password" className="pl-9" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormDescription>
              Must contain at least 8 characters, including uppercase,
              lowercase, number and special character
            </FormDescription>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Account...
              </>
            ) : (
              "Create Account"
            )}
          </Button>
        </form>
      </Form>
      <div className="text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link
          href="/login"
          className="text-primary underline-offset-4 hover:underline"
        >
          Sign in
        </Link>
      </div>
    </div>
  );
}
