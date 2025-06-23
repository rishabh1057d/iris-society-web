import json
import os
from datetime import datetime

def clear_screen():
    os.system('cls' if os.name == 'nt' else 'clear')

def prompt(msg, default=None):
    val = input(f"{msg}{' [' + default + ']' if default else ''}: ")
    return val.strip() or (default if default is not None else "")

def load_json(path):
    with open(path, 'r', encoding='utf-8') as f:
        return json.load(f)

def save_json(path, data):
    with open(path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

def update_gallery():
    gallery_path = 'public/gallery_photos.json'
    gallery = load_json(gallery_path)
    print("\n1. Add Image to Gallery")
    if input("Add new image? (Y/n): ").strip().lower() in ('', 'y', 'yes'):
        src = prompt("Image file name (in /images/)")
        photographer = prompt("Photographer name")
        alt = prompt("Alt text")
        new_id = max((img['id'] for img in gallery), default=0) + 1
        gallery.append({
            "id": new_id,
            "alt": alt,
            "src": f"/images/{src}",
            "photographer": photographer
        })
        save_json(gallery_path, gallery)
        print(f"Added image with id {new_id}.")

def update_potw():
    potw_path = 'public/potw.json'
    potw = load_json(potw_path)
    months = list(potw.keys())
    print("\n1. Add POTW")
    for i, m in enumerate(months, 1):
        print(f"{i}. {m}")
    m_idx = int(prompt("Select month number")) - 1
    month = months[m_idx]
    week = int(prompt("Week of month (1-4)"))
    # Check if week exists
    if any(p['week'] == week for p in potw[month]):
        print("POTW for this week already exists. Aborting.")
        return
    theme = prompt("Theme")
    photographer = prompt("Photographer")
    email = prompt("Email (optional)")
    description = prompt("Description (optional)")
    image = prompt("Image file name (in /images/)")
    potw[month].append({
        "week": week,
        "theme": theme,
        "photographer": photographer,
        "email": email,
        "description": description,
        "image": f"/images/{image}"
    })
    save_json(potw_path, potw)
    print(f"Added POTW for {month} week {week}.")

def update_events():
    events_path = 'public/events.json'
    deleted_path = 'public/deleted_events.json'
    changes_path = 'public/event_changes.json'
    events = load_json(events_path)
    print("\n1. Add Event\n2. Remove Event\n3. Update Event")
    choice = prompt("Select option")
    if choice == '1':
        title = prompt("Title")
        description = prompt("Description")
        dates = prompt("Dates")
        location = prompt("Location")
        collab = prompt("Collab")
        image = prompt("Image file name (in /images/)")
        ongoing = prompt("Ongoing? (Y/n)", "Y").lower() in ('y', '')
        registration_open = prompt("Registration Open? (Y/n)", "Y").lower() in ('y', '')
        registration_link = prompt("Registration Link")
        status = "ongoing" if ongoing else "previous"
        result_link = prompt("Result Link (optional)")
        new_id = max((e['id'] for e in events), default=0) + 1
        events.append({
            "id": new_id,
            "title": title,
            "description": description,
            "dates": dates,
            "location": location,
            "collab": collab,
            "image": f"/images/{image}",
            "registrationOpen": registration_open,
            "registrationLink": registration_link,
            "status": status,
            "resultLink": result_link
        })
        save_json(events_path, events)
        print(f"Added event with id {new_id}.")
    elif choice == '2':
        ongoing_events = [e for e in events if e['status'] == 'ongoing']
        previous_events = [e for e in events if e['status'] == 'previous']
        print("Ongoing Events:")
        for e in ongoing_events:
            print(f"{e['id']}: {e['title']}")
        print("Previous Events:")
        for e in previous_events:
            print(f"{e['id']}: {e['title']}")
        del_id = int(prompt("Enter id to delete"))
        event = next((e for e in events if e['id'] == del_id), None)
        if not event:
            print("Event not found.")
            return
        if prompt(f"Are you sure you want to delete '{event['title']}'? (y/N)", "N").lower() == 'y':
            events = [e for e in events if e['id'] != del_id]
            save_json(events_path, events)
            # Save to deleted_events.json
            try:
                deleted = load_json(deleted_path)
            except:
                deleted = []
            deleted.append(event)
            save_json(deleted_path, deleted)
            print("Event deleted and archived.")
    elif choice == '3':
        for e in events:
            print(f"{e['id']}: {e['title']}")
        upd_id = int(prompt("Enter id to update"))
        event = next((e for e in events if e['id'] == upd_id), None)
        if not event:
            print("Event not found.")
            return
        print(json.dumps(event, indent=2))
        fields = list(event.keys())
        for i, f in enumerate(fields):
            print(f"{i+1}. {f}")
        f_idx = int(prompt("Select field to edit (number)")) - 1
        field = fields[f_idx]
        new_val = prompt(f"Enter new value for {field}", str(event[field]))
        old_event = event.copy()
        event[field] = type(event[field])(new_val) if field != 'id' else event['id']
        save_json(events_path, events)
        # Save change to event_changes.json
        try:
            changes = load_json(changes_path)
        except:
            changes = []
        changes.append({
            "timestamp": datetime.now().isoformat(),
            "old": old_event,
            "new": event.copy()
        })
        save_json(changes_path, changes)
        print("Event updated and change logged.")

def update_team():
    curr_path = 'public/current_members.json'
    prev_path = 'public/previous_members.json'
    curr = load_json(curr_path)
    prev = load_json(prev_path)
    print("\n1. Add Member\n2. Remove Member\n3. Shift Tenure")
    choice = prompt("Select option")
    if choice == '1':
        mtype = prompt("Member type (Core/Leader/Web Dev)").lower()
        name = prompt("Name")
        role = prompt("Role")
        description = prompt("Description")
        image = prompt("Image file name (in /images/)")
        linkedin = prompt("LinkedIn (optional)")
        new_id = max([m['id'] for t in curr.values() for m in t], default=0) + 1
        member = {
            "id": new_id,
            "name": name,
            "role": role,
            "description": description,
            "image": f"/images/{image}",
            "linkedin": linkedin
        }
        if mtype.startswith('core'):
            curr['coreTeam'].append(member)
        elif mtype.startswith('lead'):
            curr['leadershipTeam'].append(member)
        elif mtype.startswith('web'):
            curr['webDevTeam'].append(member)
        else:
            print("Invalid member type.")
            return
        save_json(curr_path, curr)
        print(f"Added member with id {new_id}.")
    elif choice == '2':
        for t, members in curr.items():
            print(f"{t}:")
            for m in members:
                print(f"  {m['id']}: {m['name']}")
        del_id = int(prompt("Enter id to remove"))
        found = False
        for t in curr:
            for m in curr[t]:
                if m['id'] == del_id:
                    if prompt(f"Are you sure you want to remove '{m['name']}'? (y/N)", "N").lower() == 'y':
                        curr[t] = [mem for mem in curr[t] if mem['id'] != del_id]
                        found = True
                        break
        if found:
            save_json(curr_path, curr)
            print("Member removed.")
        else:
            print("Member not found.")
    elif choice == '3':
        tenure = prompt("Enter new tenure (e.g. 2024-2025)")
        print(f"This will move all current members to previous_members.json under tenure '{tenure}' and clear current members.")
        if prompt("Are you sure? (y/N)", "N").lower() != 'y':
            print("Aborted.")
            return
        prev[tenure] = curr.copy()
        curr = {"leadershipTeam": [], "coreTeam": [], "webDevTeam": []}
        save_json(curr_path, curr)
        save_json(prev_path, prev)
        print("Tenure shifted.")

def main():
    clear_screen()
    print("What do you want to update?")
    print("1. Update Gallery\n2. Update POTW\n3. Update Events\n4. Update Team")
    choice = prompt("Select option")
    if choice == '1':
        update_gallery()
    elif choice == '2':
        update_potw()
    elif choice == '3':
        update_events()
    elif choice == '4':
        update_team()
    else:
        print("Invalid option.")

if __name__ == "__main__":
    main()
