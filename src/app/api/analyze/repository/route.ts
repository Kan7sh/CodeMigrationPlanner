import { AuthOptions } from "@/lib/authOptions";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(AuthOptions);
    if (!session?.user.accessToken) {
      return NextResponse.json({ error: "Unauthorized", status: 401 });
    }
    const { owner, repo, branch } = await request.json();
    if (!owner || !repo) {
      return NextResponse.json(
        { error: "Owner and repo are required" },
        { status: 400 }
      );
    }
    const branchToUse = branch || "main";
  } catch (error) {}
}
