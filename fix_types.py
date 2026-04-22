import os, glob, re

files = []
for ext in ["**/*.ts", "**/*.tsx"]:
    files.extend(glob.glob(ext, recursive=True))

for f in files:
    if "node_modules" in f or ".next" in f: continue
    try:
        with open(f, "r", encoding="utf-8") as file:
            content = file.read()
            
        new_content = content
        
        # Replace variable mappings to let TypeScript infer types
        new_content = re.sub(r"\(m: Record<string, unknown>\)", "(m)", new_content)
        new_content = re.sub(r"\(member: Record<string, unknown>\)", "(member)", new_content)
        new_content = re.sub(r"\(event: Record<string, unknown>\)", "(event)", new_content)
        new_content = re.sub(r"\(sesi: Record<string, unknown>\)", "(sesi)", new_content)
        new_content = re.sub(r"\(a: Record<string, unknown>\)", "(a)", new_content)
        new_content = re.sub(r"\(u: Record<string, unknown>\)", "(u)", new_content)
        new_content = re.sub(r"\(p: Record<string, unknown>\)", "(p)", new_content)
        new_content = re.sub(r"\(user: Record<string, unknown>\)", "(user)", new_content)
        new_content = re.sub(r"\(e: Record<string, unknown>\)", "(e)", new_content)
        new_content = re.sub(r"\(absen: Record<string, unknown>,\s*i:\s*number\)", "(absen, i)", new_content)
        new_content = re.sub(r"\(event: Record<string, unknown>,\s*i:\s*number\)", "(event, i)", new_content)
        new_content = re.sub(r"\(a: Record<string, unknown>,\s*b:\s*Record<string, unknown>\)", "(a, b)", new_content)

        # Arrays
        new_content = re.sub(r"partiturList:\s*Record<string, unknown>\[\]", "partiturList: import('@prisma/client').Partitur[]", new_content)
        new_content = re.sub(r"events:\s*Record<string, unknown>\[\]", "events: import('@prisma/client').Event[]", new_content)
        new_content = re.sub(r"allEvents:\s*Record<string, unknown>\[\]", "allEvents: import('@prisma/client').Event[]", new_content)
        new_content = re.sub(r"members:\s*Record<string, unknown>\[\]", "members: import('@prisma/client').User[]", new_content)
        new_content = re.sub(r"availableUsers:\s*Record<string, unknown>\[\]", "availableUsers: import('@prisma/client').User[]", new_content)
        
        # Prop explicit Records
        new_content = re.sub(r"\{\s*user\s*\}\s*:\s*\{\s*user\s*:\s*Record<string, unknown>\s*\}", "{ user }: { user: import('@prisma/client').User }", new_content)
        new_content = re.sub(r"\{\s*event\s*\}\s*:\s*\{\s*event\s*:\s*Record<string, unknown>\s*\}", "{ event }: { event: import('@prisma/client').Event }", new_content)
        new_content = re.sub(r"partitur\?:\s*Record<string, unknown>", "partitur?: import('@prisma/client').Partitur", new_content)
        new_content = re.sub(r"\{\s*partitur,\s*onClose\s*\}\s*:\s*\{\s*partitur\s*:\s*Record<string, unknown>;\s*onClose\s*:\s*\(\)\s*=>\s*void\s*\}", "{ partitur, onClose }: { partitur: import('@prisma/client').Partitur; onClose: () => void }", new_content)

        # Explicit castings
        new_content = re.sub(r"event\s*as\s*Record<string, unknown>", "event as import('@prisma/client').Event & { [key: string]: unknown }", new_content)
        
        new_content = re.sub(r"\}\s*as\s*Record<string, unknown>", "} as never", new_content)
        
        if new_content != content:
            with open(f, "w", encoding="utf-8") as file:
                file.write(new_content)
            print(f"Fixed types in {f}")
    except Exception as e:
        print(f"Error {f}: {e}")
