# import cv2
# import numpy as np

# from app.services.insightface_service import InsightFaceService
# from app.services.milvus_service import MilvusService

# # Change this to your image path
# IMAGE_PATH = r"v1.png"


# def main():
#     insightface = InsightFaceService()
#     milvus = MilvusService()

#     image = cv2.imread(IMAGE_PATH)

#     if image is None:
#         raise RuntimeError("Unable to load image.")

#     faces = insightface.analyze_image(image)

#     print(f"Faces detected: {len(faces)}")

#     if len(faces) == 0:
#         print("No face detected.")
#         return

#     largest_face = insightface.get_largest_face(faces)

#     print("=" * 50)
#     print("Bounding Box :", largest_face.bbox)
#     print("Embedding Shape :", largest_face.embedding.shape)
#     print("Embedding Type :", type(largest_face.embedding))
#     print("First 10 values :", largest_face.embedding[:10])
#     print("=" * 50)

#     # Search in Milvus
#     matches = milvus.search(
#         embedding=largest_face.embedding,
#         top_k=5,
#     )

#     print("\nSearch Results")
#     print("=" * 50)

#     if not matches:
#         print("No matching face found in Milvus.")
#     else:
#         for match in matches:
#             print(match)

#     # Draw rectangle
#     x1, y1, x2, y2 = map(int, largest_face.bbox)

#     output = image.copy()
#     cv2.rectangle(output, (x1, y1), (x2, y2), (0, 255, 0), 2)

#     face = image[y1:y2, x1:x2]

#     cv2.imwrite("detected_face.jpg", face)
#     cv2.imwrite("detected_image.jpg", output)

#     cv2.imshow("Detected Face", face)
#     cv2.imshow("Detected Image", output)

#     cv2.waitKey(0)
#     cv2.destroyAllWindows()


# if __name__ == "__main__":
#     main()

import cv2

from app.services.insightface_service import InsightFaceService
from app.services.milvus_service import MilvusService

from app.core.database import SessionLocal
from app.models.employee import Employee

IMAGE_PATH = r"v1.png"


def main():

    insightface = InsightFaceService()
    milvus = MilvusService()
    db = SessionLocal()

    image = cv2.imread(IMAGE_PATH)

    if image is None:
        raise RuntimeError("Unable to load image.")

    faces = insightface.analyze_image(image)

    print(f"Faces detected: {len(faces)}")

    if not faces:
        print("No face detected.")
        return

    largest_face = insightface.get_largest_face(faces)

    print("=" * 60)
    print("Bounding Box :", largest_face.bbox)
    print("Embedding Shape :", largest_face.embedding.shape)
    print("=" * 60)

    # -------------------------
    # Search in Milvus
    # -------------------------
    matches = milvus.search(
        embedding=largest_face.embedding,
        top_k=5,
    )

    if not matches:
        print("No matching employee found.")
        return

    match = matches[0]

    print("\nMilvus Match")
    print(match)

    # -------------------------
    # Fetch Employee Details
    # -------------------------
    employee = (
        db.query(Employee)
        .filter(Employee.id == match["employee_id"])
        .first()
    )

    if employee is None:
        print("Employee not found in database.")
        return

    print("\nEmployee Details")
    print("=" * 60)
    print(f"ID          : {employee.id}")
    print(f"Code        : {employee.employee_code}")
    print(f"Name        : {employee.first_name}")
    print(f"Email       : {employee.email}")
    print(f"Phone       : {employee.phone}")
    # print(f"Department  : {employee.department_id}")
    # print(f"Status      : {employee.status}")

    x1, y1, x2, y2 = map(int, largest_face.bbox)

    output = image.copy()

    cv2.rectangle(
        output,
        (x1, y1),
        (x2, y2),
        (0, 255, 0),
        2,
    )

    cv2.putText(
        output,
        employee.first_name,
        (x1, y1 - 10),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.8,
        (0, 255, 0),
        2,
    )

    cv2.imshow("Recognition Result", output)

    cv2.waitKey(0)
    cv2.destroyAllWindows()

    db.close()


if __name__ == "__main__":
    main()