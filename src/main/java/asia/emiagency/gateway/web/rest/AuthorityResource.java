package asia.emiagency.gateway.web.rest;

import asia.emiagency.gateway.domain.Authority;
import asia.emiagency.gateway.repository.AuthorityRepository;
import asia.emiagency.gateway.service.AuthorityService;
import asia.emiagency.gateway.web.rest.errors.BadRequestAlertException;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import javax.validation.Valid;
import javax.validation.constraints.NotNull;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import tech.jhipster.web.util.HeaderUtil;
import tech.jhipster.web.util.reactive.ResponseUtil;

/**
 * REST controller for managing {@link asia.emiagency.gateway.domain.Authority}.
 */
@RestController
@RequestMapping("/api")
public class AuthorityResource {

    private final Logger log = LoggerFactory.getLogger(AuthorityResource.class);

    private static final String ENTITY_NAME = "authority";

    @Value("${jhipster.clientApp.name}")
    private String applicationName;

    private final AuthorityService authorityService;

    private final AuthorityRepository authorityRepository;

    public AuthorityResource(AuthorityService authorityService, AuthorityRepository authorityRepository) {
        this.authorityService = authorityService;
        this.authorityRepository = authorityRepository;
    }

    /**
     * {@code POST  /authorities} : Create a new authority.
     *
     * @param authority the authority to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with
     *         body the new authority, or with status {@code 400 (Bad Request)} if
     *         the authority has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PostMapping("/authorities")
    public Mono<ResponseEntity<Authority>> createAuthority(@Valid @RequestBody Authority authority) throws URISyntaxException {
        log.debug("REST request to save Authority : {}", authority);
        if (authority.getId() != null) {
            throw new BadRequestAlertException("A new authority cannot already have an ID", ENTITY_NAME, "idexists");
        }
        return authorityRepository
            .save(authority)
            .map(result -> {
                try {
                    return ResponseEntity
                        .created(new URI("/api/authorities/" + result.getId()))
                        .headers(HeaderUtil.createEntityCreationAlert(applicationName, true, ENTITY_NAME, result.getId().toString()))
                        .body(result);
                } catch (URISyntaxException e) {
                    throw new RuntimeException(e);
                }
            });
    }

    /**
     * {@code PUT  /authorities/:id} : Updates an existing authority.
     *
     * @param id        the id of the authority to save.
     * @param authority the authority to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body
     *         the updated authority,
     *         or with status {@code 400 (Bad Request)} if the authority is not
     *         valid,
     *         or with status {@code 500 (Internal Server Error)} if the authority
     *         couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PutMapping("/authorities/{id}")
    public Mono<ResponseEntity<Authority>> updateAuthority(
        @PathVariable(value = "id", required = false) final String id,
        @Valid @RequestBody Authority authority
    ) throws URISyntaxException {
        log.debug("REST request to update Authority : {}, {}", id, authority);
        if (authority.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, authority.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        return authorityRepository
            .existsById(id)
            .flatMap(exists -> {
                if (!exists) {
                    return Mono.error(new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound"));
                }

                return authorityRepository
                    .save(authority)
                    .switchIfEmpty(Mono.error(new ResponseStatusException(HttpStatus.NOT_FOUND)))
                    .map(result ->
                        ResponseEntity
                            .ok()
                            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, true, ENTITY_NAME, result.getId().toString()))
                            .body(result)
                    );
            });
    }

    /**
     * {@code PATCH  /authorities/:id} : Partial updates given fields of an existing
     * authority, field will ignore if it is null
     *
     * @param id        the id of the authority to save.
     * @param authority the authority to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body
     *         the updated authority,
     *         or with status {@code 400 (Bad Request)} if the authority is not
     *         valid,
     *         or with status {@code 404 (Not Found)} if the authority is not found,
     *         or with status {@code 500 (Internal Server Error)} if the authority
     *         couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PatchMapping(value = "/authorities/{id}", consumes = { "application/json", "application/merge-patch+json" })
    public Mono<ResponseEntity<Authority>> partialUpdateAuthority(
        @PathVariable(value = "id", required = false) final String id,
        @NotNull @RequestBody Authority authority
    ) throws URISyntaxException {
        log.debug("REST request to partial update Authority partially : {}, {}", id, authority);
        if (authority.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, authority.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        return authorityRepository
            .existsById(id)
            .flatMap(exists -> {
                if (!exists) {
                    return Mono.error(new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound"));
                }

                Mono<Authority> result = authorityService.partialUpdate(authority);

                return result
                    .switchIfEmpty(Mono.error(new ResponseStatusException(HttpStatus.NOT_FOUND)))
                    .map(res ->
                        ResponseEntity
                            .ok()
                            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, true, ENTITY_NAME, res.getId().toString()))
                            .body(res)
                    );
            });
    }

    /**
     * {@code GET  /authorities} : get all the authorities.
     *
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list
     *         of authorities in body.
     */
    @GetMapping("/authorities")
    public Mono<List<Authority>> getAllAuthoritys() {
        log.debug("REST request to get all Authoritys");
        return authorityRepository.findAll().collectList();
    }

    /**
     * {@code GET  /authorities} : get all the authorities as a stream.
     *
     * @return the {@link Flux} of authorities.
     */
    @GetMapping(value = "/authorities", produces = MediaType.APPLICATION_NDJSON_VALUE)
    public Flux<Authority> getAllAuthoritysAsStream() {
        log.debug("REST request to get all Authoritys as a stream");
        return authorityRepository.findAll();
    }

    /**
     * {@code GET  /authorities/:id} : get the "id" authority.
     *
     * @param id the id of the authority to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body
     *         the authority, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/authorities/{id}")
    public Mono<ResponseEntity<Authority>> getAuthority(@PathVariable Long id) {
        log.debug("REST request to get Authority : {}", id);
        Mono<Authority> authority = authorityRepository.findOneById(id);
        return ResponseUtil.wrapOrNotFound(authority);
    }

    /**
     * {@code DELETE  /authorities/:id} : delete the "id" authority.
     *
     * @param id the id of the authority to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @DeleteMapping("/authorities/{id}")
    @ResponseStatus(code = HttpStatus.NO_CONTENT)
    public Mono<ResponseEntity<Void>> deleteAuthority(@PathVariable Long id) {
        log.debug("REST request to delete Authority : {}", id);
        return authorityRepository
            .deleteById(id)
            .map(result ->
                ResponseEntity
                    .noContent()
                    .headers(HeaderUtil.createEntityDeletionAlert(applicationName, true, ENTITY_NAME, id.toString()))
                    .build()
            );
    }
}
