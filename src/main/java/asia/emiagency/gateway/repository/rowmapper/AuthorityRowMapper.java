package asia.emiagency.gateway.repository.rowmapper;

import asia.emiagency.gateway.domain.Authority;
import asia.emiagency.gateway.service.ColumnConverter;
import io.r2dbc.spi.Row;
import java.util.function.BiFunction;
import org.springframework.stereotype.Service;

/**
 * Converter between {@link Row} to {@link Authority}, with proper type conversions.
 */
@Service
public class AuthorityRowMapper implements BiFunction<Row, String, Authority> {

    private final ColumnConverter converter;

    public AuthorityRowMapper(ColumnConverter converter) {
        this.converter = converter;
    }

    /**
     * Take a {@link Row} and a column prefix, and extract all the fields.
     * @return the {@link Authority} stored in the database.
     */
    @Override
    public Authority apply(Row row, String prefix) {
        Authority entity = new Authority();
        entity.setName(converter.fromRow(row, prefix + "_name", String.class));
        return entity;
    }
}
