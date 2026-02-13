from nova_notes import healthcheck


def test_smoke() -> None:
    assert healthcheck() == "ok"
