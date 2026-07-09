from app.enums.attendance_event_type import AttendanceEventType


class AttendanceCalculationService:

	# ==========================================================
	# Calculate Working Window
	# ==========================================================

	def calculate_working_window(
		self,
		logs,
	):

		first_check_in = None
		last_check_out = None
		open_entry_time = None
		total_working_seconds = 0

		for log in logs:

			if log.event_type == AttendanceEventType.ENTRY:

				if first_check_in is None:
					first_check_in = log.recognition_time

				open_entry_time = log.recognition_time

				continue

			if log.event_type == AttendanceEventType.EXIT and open_entry_time is not None:

				if log.recognition_time >= open_entry_time:
					total_working_seconds += (log.recognition_time - open_entry_time).total_seconds()
					last_check_out = log.recognition_time

				open_entry_time = None

		total_working_minutes = int(total_working_seconds // 60)

		return first_check_in, last_check_out, total_working_minutes
