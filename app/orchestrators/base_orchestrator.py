from abc import ABC
from abc import abstractmethod


class BaseOrchestrator(ABC):

    @abstractmethod
    def process(self, message):
        pass