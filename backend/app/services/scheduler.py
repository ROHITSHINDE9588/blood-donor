from apscheduler.schedulers.background import BackgroundScheduler


def start_scheduler() -> BackgroundScheduler:
    scheduler = BackgroundScheduler(timezone="UTC")
    scheduler.start()
    return scheduler
