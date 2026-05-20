import random
import string

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.security import get_caregiver, get_current_user
from app.db.database import get_db
from app.db.models import Tag, User
from app.db.schemas import TagCreate, TagOut, TagPublic, TagUpdate

router = APIRouter(prefix="/tags", tags=["NFC Tags"])


def _generate_tag_id(db: Session, length: int = 8) -> str:
    """Generate a unique alphanumeric tag ID."""
    chars = string.ascii_uppercase + string.digits
    for _ in range(20):  # max 20 attempts
        tag_id = "".join(random.choices(chars, k=length))
        if not db.query(Tag).filter(Tag.id == tag_id).first():
            return tag_id
    raise RuntimeError("Could not generate a unique tag ID. Please retry.")


# ── CAREGIVER-ONLY: Create a tag ──────────────────────────────────────────

@router.post("/create", response_model=TagOut, status_code=status.HTTP_201_CREATED)
def create_tag(
    payload: TagCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_caregiver),   # Caregiver auth required
):
    """
    Caregiver creates a new NFC tag with a text description.
    Returns the 8-char tag ID to be programmed onto a physical sticker.
    """
    tag_id = _generate_tag_id(db)
    tag = Tag(
        id=tag_id,
        description=payload.description,
        owner_id=current_user.id,
    )
    db.add(tag)
    db.commit()
    db.refresh(tag)
    return tag


@router.put("/{tag_id}", response_model=TagOut)
def update_tag(
    tag_id: str,
    payload: TagUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_caregiver),
):
    """Update the description of an existing tag (caregiver + owner only)."""
    tag = db.query(Tag).filter(Tag.id == tag_id).first()
    if not tag:
        raise HTTPException(status_code=404, detail="Tag not found.")
    if tag.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="You don't own this tag.")

    tag.description = payload.description
    db.commit()
    db.refresh(tag)
    return tag


@router.delete("/{tag_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_tag(
    tag_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_caregiver),
):
    """Delete a tag (owner caregiver only)."""
    tag = db.query(Tag).filter(Tag.id == tag_id).first()
    if not tag:
        raise HTTPException(status_code=404, detail="Tag not found.")
    if tag.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="You don't own this tag.")

    db.delete(tag)
    db.commit()


@router.get("/my", response_model=list[TagOut])
def my_tags(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Return all tags created by the current caregiver."""
    return db.query(Tag).filter(Tag.owner_id == current_user.id).all()


# ── PUBLIC: Scan a tag ────────────────────────────────────────────────────

@router.get("/{tag_id}", response_model=TagPublic)
def read_tag(tag_id: str, db: Session = Depends(get_db)):
    """
    PUBLIC endpoint – visually impaired users scan an NFC sticker and the
    app calls this to get the description text, which is then spoken aloud.
    """
    tag = db.query(Tag).filter(Tag.id == tag_id).first()
    if not tag:
        raise HTTPException(
            status_code=404,
            detail="Tag not found. The sticker may not have been programmed yet.",
        )
    return tag
