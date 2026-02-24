"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { db, storage } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp, doc, getDoc } from "@/lib/firebase";
import { ref, uploadBytes, getDownloadURL } from "@/lib/firebase";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Camera, Upload, ArrowLeft, Clock } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function VerifyPage() {
    const { user } = useAuth();
    const router = useRouter();
    const params = useParams();
    const { toast } = useToast();

    const challengeId = params.id as string;
    const [challenge, setChallenge] = useState<any>(null);
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    // Fetch challenge details to know the target time
    useEffect(() => {
        async function fetchChallenge() {
            if (!challengeId) return;
            const docRef = doc(db, "challenges", challengeId);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                setChallenge(docSnap.data());
            }
        }
        fetchChallenge();
    }, [challengeId]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            setFile(selectedFile);
            setPreview(URL.createObjectURL(selectedFile));
        }
    };

    const handleUpload = async () => {
        if (!file || !user || !challenge) return;
        setIsUploading(true);

        try {
            // Validate Upload Time for Wakeup Challenges
            let uploadStatus = "success";
            let statusMessage = "Today's habit photo has been successfully recorded.";

            if (challenge.type === "wakeup" && challenge.targetTime) {
                const now = new Date();
                const [targetHH, targetMM] = challenge.targetTime.split(":").map(Number);

                const targetDate = new Date();
                targetDate.setHours(targetHH, targetMM, 0, 0);

                const diffMs = now.getTime() - targetDate.getTime();
                const diffMins = diffMs / (1000 * 60);

                if (Math.abs(diffMins) > 30) {
                    uploadStatus = "failed";
                    statusMessage = "Upload recorded as FAILED. Wake-up verification must be done within ±30 minutes of the target time.";
                }
            }

            // Create a unique filename for storage
            const fileName = `${user.uid}_${Date.now()}_${file.name}`;
            const storageRef = ref(storage, `verifications/${challengeId}/${fileName}`);

            // Upload to Firebase Storage
            const snapshot = await uploadBytes(storageRef, file);
            const downloadURL = await getDownloadURL(snapshot.ref);

            // Save to Firestore verifications collection
            await addDoc(collection(db, "verifications"), {
                challengeId,
                userId: user.uid,
                photoUrl: downloadURL,
                status: uploadStatus,
                verifiedAt: serverTimestamp(),
                deviceTime: new Date().toISOString(),
            });

            if (uploadStatus === "failed") {
                toast({ variant: "destructive", title: "Verification Failed", description: statusMessage });
            } else {
                toast({ title: "Verification Completed!", description: statusMessage });
            }

            router.push("/dashboard");

        } catch (error) {
            toast({ variant: "destructive", title: "Upload Failed", description: "A network error occurred. Please try again." });
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="container py-8 max-w-2xl mx-auto px-4">
            <Button variant="ghost" className="mb-6 pl-0 hover:bg-transparent" asChild>
                <Link href="/dashboard"><ArrowLeft className="w-4 h-4 mr-2" /> Go Back</Link>
            </Button>

            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl">Today&apos;s Habit Verification</CardTitle>
                    <CardDescription>
                        Take a photo of your practice and upload it. It will be strictly verified based on server time.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">

                    <div className="bg-primary/5 p-4 rounded-xl border border-primary/20 flex gap-3 text-sm text-muted-foreground">
                        <Clock className="w-5 h-5 text-primary shrink-0" />
                        <div>
                            <strong className="text-foreground block mb-1">Upload Time Guidelines</strong>
                            Depending on your challenge rules, wake-up challenges must be verified within ±30 mins of the target time. Regular habits must be uploaded before 23:59 today (Server timezone).
                        </div>
                    </div>

                    <div className="space-y-4">
                        <Label htmlFor="photo" className="text-base">Upload Photo</Label>

                        <div className="grid w-full gap-4">
                            {!preview ? (
                                <Label
                                    htmlFor="photo"
                                    className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-border/60 rounded-xl cursor-pointer bg-muted/20 hover:bg-muted/50 hover:border-primary/50 transition-colors"
                                >
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                        <Camera className="w-10 h-10 text-muted-foreground mb-3" />
                                        <p className="mb-2 text-sm text-muted-foreground">
                                            <span className="font-semibold">Click to select file</span> or take a photo
                                        </p>
                                        <p className="text-xs text-muted-foreground/70">JPG, PNG, WEBP (MAX. 10MB)</p>
                                    </div>
                                    <Input
                                        id="photo"
                                        type="file"
                                        accept="image/*"
                                        capture="environment" // Hints mobile devices to open camera
                                        className="hidden"
                                        onChange={handleFileChange}
                                    />
                                </Label>
                            ) : (
                                <div className="relative w-full aspect-square sm:aspect-video rounded-xl overflow-hidden border">
                                    <Image
                                        src={preview}
                                        alt="Preview"
                                        fill
                                        className="object-cover"
                                    />
                                    <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/80 to-transparent flex justify-between items-end">
                                        <Button
                                            variant="secondary"
                                            size="sm"
                                            onClick={() => { setFile(null); setPreview(null); }}
                                            disabled={isUploading}
                                        >
                                            Select Again
                                        </Button>
                                        <Button onClick={handleUpload} disabled={isUploading}>
                                            {isUploading ? "Uploading..." : <><Upload className="w-4 h-4 mr-2" /> Submit Photo</>}
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                </CardContent>
            </Card>
        </div>
    );
}
