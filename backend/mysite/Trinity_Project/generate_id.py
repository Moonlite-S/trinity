from datetime import datetime
from .models import Project

# def generate_project_id():
#     now = datetime.now()
#     year = now.year % 100  # Get last two digits of the year
#     month = now.month

#     # Determine the quarter
#     if 1 <= month <= 3:
#         quarter = '1'
#     elif 4 <= month <= 6:
#         quarter = '2'
#     elif 7 <= month <= 9:
#         quarter = '3'
#     else:
#         quarter = '4'


#     submissions_count = Project.objects.filter(
#         created_at__year=now.year,
#         created_at__month__in=[1, 2, 3] if quarter == '1' else
#                             [4, 5, 6] if quarter == '2' else
#                             [7, 8, 9] if quarter == '3' else
#                             [10, 11, 12]
#     ).count() + 1  # Adding 1 for the current submission

#     # Format the submission number
#     submission_number = f"{submissions_count:03d}"  # Zero-padded to 3 digits

#     generated_id = f"{year}.{quarter}.{submission_number}"

#     return generated_id